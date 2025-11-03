// Minimal Sheets proxy for localhost (Service Account on server side)
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Simple logging
app.use((req, _res, next) => {
  console.log(`[sheets-proxy] ${req.method} ${req.url}`);
  next();
});

function buildAuth() {
  // Prefer GOOGLE_APPLICATION_CREDENTIALS (file path) or GOOGLE_CREDENTIALS_BASE64 (base64 of JSON)
  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  let credentialsJson;
  if (process.env.GOOGLE_CREDENTIALS_BASE64) {
    credentialsJson = JSON.parse(Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64, 'base64').toString('utf-8'));
  } else if (credPath) {
    const resolved = path.resolve(credPath);
    credentialsJson = JSON.parse(fs.readFileSync(resolved, 'utf-8'));
  } else {
    throw new Error('Missing GOOGLE_APPLICATION_CREDENTIALS or GOOGLE_CREDENTIALS_BASE64');
  }

  return new google.auth.JWT(
    credentialsJson.client_email,
    undefined,
    credentialsJson.private_key,
    [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.readonly'
    ]
  );
}

function toDateSafe(value) {
  // Handle ISO, dd/MM/yyyy [HH:mm:ss], and Google Sheets serial numbers
  if (typeof value === 'number') {
    // Google Sheets serial date -> JS Date (epoch starting 1899-12-30)
    const millis = (value - 25569) * 86400 * 1000; // 25569 days between 1899-12-30 and 1970-01-01
    const d = new Date(millis);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof value === 'string') {
    const s = value.trim();
    // Try native Date first (handles ISO)
    const iso = new Date(s);
    if (!isNaN(iso.getTime())) return iso;
    // Try dd/MM/yyyy HH:mm:ss or dd/MM/yyyy
    const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
    if (m) {
      const day = parseInt(m[1], 10);
      const month = parseInt(m[2], 10) - 1;
      const year = parseInt(m[3], 10);
      const hh = m[4] ? parseInt(m[4], 10) : 0;
      const mm = m[5] ? parseInt(m[5], 10) : 0;
      const ss = m[6] ? parseInt(m[6], 10) : 0;
      const d = new Date(year, month, day, hh, mm, ss);
      return isNaN(d.getTime()) ? null : d;
    }
  }
  return null;
}

// GET /sheets-proxy/latest?spreadsheetId=...&sheetName=...&since=ISO
app.get(['/sheets-proxy/latest', '/latest'], async (req, res) => {
  try {
    const { spreadsheetId, sheetName, since } = req.query;
    if (!spreadsheetId || !sheetName) {
      return res.status(400).json({ error: 'spreadsheetId, sheetName are required' });
    }

    const auth = buildAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const range = `${sheetName}!A:C`;
    const r = await sheets.spreadsheets.values.get({ spreadsheetId, range });
    const rows = r.data.values || [];
    if (rows.length === 0) return res.json({ row: undefined });

    // assume header in first row
    const header = rows[0].map(h => (h || '').toString().trim().toLowerCase());
    const idIdx = header.indexOf('id');
    const qrIdx = header.indexOf('qr_code');
    const timeIdx = header.indexOf('ngay_tao');
    const sinceDate = since ? toDateSafe(since) : null;

    // Find absolute latest row by ngay_tao
    let latest = null;
    let latestRowNumber = -1;
    let latestDate = null;
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const ngay = row[timeIdx];
      const d = toDateSafe(ngay);
      if (!d) continue;
      if (!latestDate || d > latestDate) {
        latestDate = d;
        latest = {
          id: row[idIdx] || '',
          qr_code: row[qrIdx] || '',
          ngay_tao: row[timeIdx] || ''
        };
        latestRowNumber = i + 1; // 1-based including header
      }
    }

    if (!latest) {
      console.log('[sheets-proxy] no valid dated rows');
      return res.json({ row: undefined });
    }

    const isNewer = sinceDate ? (latestDate && latestDate > sinceDate) : true;
    console.log('[sheets-proxy] latestDate=', latestDate?.toISOString(), 'since=', sinceDate?.toISOString(), 'isNewer=', isNewer);
    // Trả về latest luôn, frontend sẽ xoá hàng sau khi đọc để tránh lặp lại
    return res.json({ row: { ...latest, rowNumber: latestRowNumber, isNewer } });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'internal_error' });
  }
});

// DELETE /row  { spreadsheetId, sheetName, rowNumber }
app.delete(['/sheets-proxy/row', '/row'], async (req, res) => {
  try {
    const { spreadsheetId, sheetName, rowNumber } = req.body || {};
    if (!spreadsheetId || !sheetName || !rowNumber) {
      return res.status(400).json({ error: 'spreadsheetId, sheetName, rowNumber are required' });
    }

    const auth = buildAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    // rowNumber is 1-based; we need 0-based and exclude header if we want to delete actual row
    const index = Number(rowNumber) - 1;
    if (index <= 0) return res.status(400).json({ error: 'refusing to delete header or invalid row' });

    // find sheetId by name
    const ss = await sheets.spreadsheets.get({ spreadsheetId });
    const sheet = (ss.data.sheets || []).find(s => s.properties?.title === sheetName);
    if (!sheet || sheet.properties?.sheetId == null) {
      return res.status(400).json({ error: 'sheetName not found' });
    }

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: sheet.properties.sheetId,
                dimension: 'ROWS',
                startIndex: index,
                endIndex: index + 1
              }
            }
          }
        ]
      }
    });

    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'internal_error' });
  }
});

// Health check and quick inspect
app.get(['/sheets-proxy/health', '/health'], async (req, res) => {
  try {
    const { spreadsheetId, sheetName } = req.query;
    if (!spreadsheetId || !sheetName) {
      return res.status(400).json({ error: 'spreadsheetId, sheetName are required' });
    }

    const auth = buildAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    const titles = (meta.data.sheets || []).map(s => s.properties?.title);
    const range = `${sheetName}!A:C`;
    const r = await sheets.spreadsheets.values.get({ spreadsheetId, range });
    const rows = r.data.values || [];
    const header = rows[0] || [];
    const sample = rows[1] || [];
    return res.json({ ok: true, availableSheets: titles, range, header, sample, rows: rows.length });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, error: String(e) });
  }
});

const PORT = process.env.SHEETS_PROXY_PORT ? Number(process.env.SHEETS_PROXY_PORT) : 5175;
app.listen(PORT, () => {
  console.log(`Sheets proxy listening on http://localhost:${PORT}`);
});


