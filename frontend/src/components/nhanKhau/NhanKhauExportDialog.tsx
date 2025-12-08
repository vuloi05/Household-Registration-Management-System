// src/components/nhanKhau/NhanKhauExportDialog.tsx

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import type { NhanKhau } from '../../api/nhanKhauApi';
import { exportToExcel, exportToPDF, generatePDFBlobUrl } from '../../utils/exportUtils';

interface NhanKhauExportDialogProps {
  open: boolean;
  onClose: () => void;
  exportType: 'excel' | 'pdf';
  allNhanKhau: NhanKhau[];
  loadAllDataForExport: () => Promise<NhanKhau[]>;
  setAllNhanKhau: (data: NhanKhau[]) => void;
}

export default function NhanKhauExportDialog({
  open,
  onClose,
  exportType,
  allNhanKhau,
  loadAllDataForExport,
  setAllNhanKhau,
}: NhanKhauExportDialogProps) {
  const [exportSearchTerm, setExportSearchTerm] = useState('');
  const [exportFrom, setExportFrom] = useState<string>('');
  const [exportTo, setExportTo] = useState<string>('');
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);

  // Lọc dữ liệu theo các điều kiện export
  const getFilteredExportData = async () => {
    // Load toàn bộ dữ liệu nếu chưa có
    let allData = allNhanKhau;
    if (allData.length === 0) {
      allData = await loadAllDataForExport();
      setAllNhanKhau(allData);
    }

    // Lọc dữ liệu
    let filteredData = [...allData];

    // Lọc theo họ tên, CCCD, quê quán, ngày sinh
    if (exportSearchTerm.trim()) {
      const searchLower = exportSearchTerm.toLowerCase();
      filteredData = filteredData.filter(nk => {
        const hoTen = (nk.hoTen || '').toLowerCase();
        const cmndCccd = (nk.cmndCccd || '').toLowerCase();
        const queQuan = (nk.queQuan || '').toLowerCase();
        const ngaySinh = nk.ngaySinh ? nk.ngaySinh.toString() : '';
        return hoTen.includes(searchLower) || 
               cmndCccd.includes(searchLower) || 
               queQuan.includes(searchLower) ||
               ngaySinh.includes(searchLower);
      });
    }

    // Lọc theo ngày sinh (chỉ khi có nhập)
    if (exportFrom || exportTo) {
      filteredData = filteredData.filter(nk => {
        const ngaySinh = nk.ngaySinh;
        if (!ngaySinh) return false;
        if (exportFrom && ngaySinh < exportFrom) return false;
        if (exportTo && ngaySinh > exportTo) return false;
        return true;
      });
    }

    return filteredData;
  };

  const handleClose = () => {
    setExportSearchTerm('');
    setExportFrom('');
    setExportTo('');
    onClose();
  };

  const handlePreviewPDF = async () => {
    try {
      const filteredData = await getFilteredExportData();

      if (filteredData.length === 0) {
        setToastSeverity('warning');
        setToastMsg('Không có dữ liệu phù hợp với bộ lọc');
        setToastOpen(true);
        return;
      }

      // Tạo blob URL và mở modal preview
      const pdfUrl = generatePDFBlobUrl(filteredData, 'Danh sach Nhan khau');
      setPreviewPdfUrl(pdfUrl);
      setPreviewOpen(true);
    } catch (e) {
      console.error('Preview failed', e);
      setToastSeverity('error');
      setToastMsg('Xem trước PDF thất bại');
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

  const handleExportConfirm = async () => {
    try {
      const filteredData = await getFilteredExportData();

      if (filteredData.length === 0) {
        setToastSeverity('warning');
        setToastMsg('Không có dữ liệu phù hợp với bộ lọc');
        setToastOpen(true);
        return;
      }

      if (exportType === 'excel') {
        exportToExcel(filteredData, 'Danh_sach_nhan_khau');
        setToastSeverity('success');
        setToastMsg('Xuất Excel thành công');
      } else {
        exportToPDF(filteredData, 'Danh sach Nhan khau');
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

  return (
    <>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Tùy chọn xuất {exportType === 'excel' ? 'Excel' : 'PDF'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Lọc theo họ tên, CCCD, quê quán, ngày sinh..."
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
            <Button variant="outlined" onClick={handlePreviewPDF}>
              Xem trước
            </Button>
          )}
          <Button variant="contained" onClick={handleExportConfirm}>Xuất</Button>
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

