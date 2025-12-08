// src/components/khoanThu/KhoanThuExportDialog.tsx

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import type { KhoanThu } from '../../api/khoanThuApi';
import type { LichSuNopTien } from '../../api/nopTienApi';
import type { HoKhau } from '../../api/hoKhauApi';
import { exportToExcel, exportToPDF, generatePDFBlobUrl, type ExportRow } from '../../utils/khoanThuExportUtils';

interface KhoanThuExportDialogProps {
  open: boolean;
  onClose: () => void;
  exportType: 'excel' | 'pdf';
  khoanThu: KhoanThu;
  lichSuList: LichSuNopTien[];
  allHouseholds: HoKhau[];
  makeSearchableText: (item: LichSuNopTien) => string;
}

export default function KhoanThuExportDialog({
  open,
  onClose,
  exportType,
  khoanThu,
  lichSuList,
  allHouseholds,
  makeSearchableText,
}: KhoanThuExportDialogProps) {
  const [exportStatus, setExportStatus] = useState<'ALL' | 'PAID' | 'UNPAID'>('PAID');
  const [exportSearchTerm, setExportSearchTerm] = useState('');
  const [exportFrom, setExportFrom] = useState<string>('');
  const [exportTo, setExportTo] = useState<string>('');
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);

  // Build export rows based on dialog options
  const buildExportRows = (): ExportRow[] => {
    // Helper compare date within range (inclusive)
    const inRange = (ngay: string | undefined): boolean => {
      if (!ngay) return false;
      if (exportFrom && ngay < exportFrom) return false;
      if (exportTo && ngay > exportTo) return false;
      return true;
    };

    if (exportStatus === 'PAID') {
      const paid = lichSuList.filter(r => {
        if (!exportFrom && !exportTo) return true;
        return inRange(r.ngayNop);
      });
      return paid.filter(item => {
        if (!exportSearchTerm) return true;
        const searchableText = makeSearchableText(item);
        return searchableText.includes(exportSearchTerm.toLowerCase());
      }).map(r => ({
        hoTen: r.hoKhau.chuHo?.hoTen || '',
        diaChi: r.hoKhau.diaChi || '',
        ngayNop: r.ngayNop || '',
        soTien: r.soTien || 0,
      }));
    }

    const hoDaNopIds = new Set(lichSuList.map(r => r.hoKhau.id));

    if (exportStatus === 'UNPAID') {
      return allHouseholds
        .filter(h => !hoDaNopIds.has(h.id))
        .map(h => ({
          hoTen: h.chuHo?.hoTen || '',
          diaChi: h.diaChi || '',
          ngayNop: '',
          soTien: 0,
        }));
    }

    // ALL
    const rowsPaid = lichSuList.filter(r => {
      if (!exportFrom && !exportTo) return true;
      return inRange(r.ngayNop);
    }).map(r => ({
      hoTen: r.hoKhau.chuHo?.hoTen || '',
      diaChi: r.hoKhau.diaChi || '',
      ngayNop: r.ngayNop || '',
      soTien: r.soTien || 0,
    }));

    const rowsUnpaid = allHouseholds
      .filter(h => !hoDaNopIds.has(h.id))
      .map(h => ({
        hoTen: h.chuHo?.hoTen || '',
        diaChi: h.diaChi || '',
        ngayNop: '',
        soTien: 0,
      }));

    return [...rowsPaid, ...rowsUnpaid];
  };

  const handleClose = () => {
    setExportStatus('PAID');
    setExportSearchTerm('');
    setExportFrom('');
    setExportTo('');
    onClose();
  };

  const handlePreview = () => {
    if (!exportFrom || !exportTo) {
      setToastSeverity('error');
      setToastMsg('Xem trước PDF thất bại: vui lòng chọn Từ ngày và Đến ngày');
      setToastOpen(true);
      return;
    }
    try {
      const rows = buildExportRows();
      const pdfUrl = generatePDFBlobUrl(rows, khoanThu);
      setPreviewPdfUrl(pdfUrl);
      setPreviewOpen(true);
    } catch (e) {
      console.error('Preview failed', e);
      setToastSeverity('error');
      setToastMsg('Xem trước PDF thất bại');
      setToastOpen(true);
    }
  };

  const handleExport = () => {
    if (!exportFrom || !exportTo) {
      setToastSeverity('error');
      setToastMsg(`Xuất ${exportType === 'excel' ? 'Excel' : 'PDF'} thất bại: vui lòng chọn Từ ngày và Đến ngày`);
      setToastOpen(true);
      return;
    }
    try {
      const rows = buildExportRows();
      if (exportType === 'excel') {
        exportToExcel(rows);
        setToastSeverity('success');
        setToastMsg('Xuất Excel thành công');
      } else {
        exportToPDF(rows, khoanThu);
        setToastSeverity('success');
        setToastMsg('Xuất PDF thành công');
      }
      setToastOpen(true);
      handleClose();
    } catch (e) {
      console.error('Export failed', e);
      setToastSeverity('error');
      setToastMsg(`Xuất ${exportType === 'excel' ? 'Excel' : 'PDF'} thất bại`);
      setToastOpen(true);
    }
  };

  const handleClosePreview = () => {
    if (previewPdfUrl) {
      URL.revokeObjectURL(previewPdfUrl);
      setPreviewPdfUrl(null);
    }
    setPreviewOpen(false);
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Tùy chọn xuất {exportType === 'excel' ? 'Excel' : 'PDF'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Đối tượng</InputLabel>
              <Select
                label="Đối tượng"
                value={exportStatus}
                onChange={(e) => setExportStatus(e.target.value as 'ALL' | 'PAID' | 'UNPAID')}
              >
                <MenuItem value="PAID">Chỉ hộ đã nộp</MenuItem>
                <MenuItem value="UNPAID">Chỉ hộ chưa nộp</MenuItem>
                <MenuItem value="ALL">Tất cả</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Lọc theo họ tên, địa chỉ..."
              value={exportSearchTerm}
              onChange={(e) => setExportSearchTerm(e.target.value)}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                type="date"
                label="Từ ngày"
                InputLabelProps={{ shrink: true }}
                value={exportFrom}
                onChange={(e) => setExportFrom(e.target.value)}
                fullWidth
              />
              <TextField
                type="date"
                label="Đến ngày"
                InputLabelProps={{ shrink: true }}
                value={exportTo}
                onChange={(e) => setExportTo(e.target.value)}
                fullWidth
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Hủy</Button>
          {exportType === 'pdf' && (
            <Button variant="outlined" onClick={handlePreview}>
              Xem trước
            </Button>
          )}
          <Button variant="contained" onClick={handleExport}>
            Xuất
          </Button>
        </DialogActions>
      </Dialog>

      {/* PDF Preview Modal */}
      <Dialog
        open={previewOpen}
        onClose={handleClosePreview}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            height: '90vh',
            maxHeight: '90vh',
          },
        }}
      >
        <DialogTitle>
          Xem trước PDF
          <IconButton
            aria-label="close"
            onClick={handleClosePreview}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <ClearIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
          {previewPdfUrl && (
            <iframe
              src={previewPdfUrl}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                flex: 1,
              }}
              title="PDF Preview"
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePreview}>Đóng</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar notifications */}
      <Snackbar
        open={toastOpen}
        autoHideDuration={3500}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert elevation={6} variant="filled" onClose={() => setToastOpen(false)} severity={toastSeverity} sx={{ width: '100%' }}>
          {toastMsg}
        </Alert>
      </Snackbar>
    </>
  );
}

