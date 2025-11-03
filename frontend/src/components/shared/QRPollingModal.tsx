import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, CircularProgress, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

interface QRPollingModalProps {
  open: boolean;
  onClose: () => void;
  onReceiveQRCode: (qrCode: string) => void;
}

type SheetRow = {
  id: string;
  qr_code: string;
  ngay_tao: string;
  rowNumber: number; // 1-based
};

export default function QRPollingModal({ open, onClose, onReceiveQRCode }: QRPollingModalProps) {
  const [status, setStatus] = useState<string>("Đang chờ dữ liệu từ AppSheet...");
  const [tries, setTries] = useState<number>(0);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const startedAt = useRef<string>("");
  const timerRef = useRef<number | null>(null);

  const spreadsheetId = useMemo(() => import.meta.env.VITE_SHEETS_SPREADSHEET_ID as string, []);
  const sheetName = useMemo(() => (import.meta.env.VITE_SHEETS_SHEET_NAME as string) || "Sheet1", []);

  useEffect(() => {
    if (!open) return;

    // Allow a small window so rows vừa quét trước khi mở modal vẫn được nhận
    startedAt.current = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    setStatus("Đang chờ dữ liệu từ AppSheet...");
    setTries(0);

    const poll = async () => {
      try {
        const url = `/sheets-proxy/latest?spreadsheetId=${encodeURIComponent(spreadsheetId)}&sheetName=${encodeURIComponent(sheetName)}&since=${encodeURIComponent(startedAt.current)}`;
        const res = await fetch(url, { method: 'GET' });
        if (!res.ok) throw new Error('Không thể gọi Sheets proxy');
        const data: { row?: SheetRow } = await res.json();
        if (data.row && data.row.qr_code) {
          setStatus("Đã nhận dữ liệu. Đang dọn hàng trong Google Sheet...");
          setIsDeleting(true);
          // cleanup row
          await fetch(`/sheets-proxy/row`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ spreadsheetId, sheetName, rowNumber: data.row.rowNumber })
          });
          setIsDeleting(false);
          onReceiveQRCode(data.row.qr_code);
          onClose();
          return;
        }
      } catch (e) {
        console.error('[QRPolling] error calling proxy', e);
      } finally {
        setTries(prev => prev + 1);
      }
      timerRef.current = window.setTimeout(poll, 3000);
    };

    // kick off
    poll();

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, [open, onClose, onReceiveQRCode, sheetName, spreadsheetId]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography variant="h6" component="div">Chờ quét QR từ AppSheet</Typography>
        <IconButton aria-label="close" onClick={onClose} sx={{ color: (theme) => theme.palette.grey[500] }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, textAlign: 'center' }}>
          <CircularProgress size={36} />
          <Typography variant="body1">{status}</Typography>
          <Typography variant="body2" color="text.secondary">Lần kiểm tra: {tries}</Typography>
          {isDeleting && (
            <Typography variant="caption" color="text.secondary">Đang xóa hàng vừa đọc khỏi Google Sheet...</Typography>
          )}
          <Typography variant="body2" color="text.secondary">
            Mở AppSheet, quét QR, dữ liệu sẽ tự đồng bộ sau vài giây.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 1 }}>
        <Button onClick={onClose} variant="outlined">Hủy</Button>
      </DialogActions>
    </Dialog>
  );
}


