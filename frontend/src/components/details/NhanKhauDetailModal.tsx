// src/components/details/NhanKhauDetailModal.tsx

import {
  Dialog, DialogTitle, DialogContent, Typography,
  Divider, IconButton, Box
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { NhanKhau } from '../../api/nhanKhauApi';

// Component con giúp hiển thị một dòng thông tin (label: value) cho gọn gàng
// Đã được viết lại bằng Box và Flexbox
const InfoRow = ({ label, value }: { label: string, value: string | null | undefined }) => (
  <Box sx={{ display: 'flex', py: 0.75 }}>
    <Box sx={{ width: '40%', minWidth: '150px' }}>
      <Typography variant="body2" color="text.secondary">{label}:</Typography>
    </Box>
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="body1" sx={{ fontWeight: 500 }}>
        {value || 'Chưa có thông tin'}
      </Typography>
    </Box>
  </Box>
);

interface NhanKhauDetailModalProps {
  open: boolean;
  onClose: () => void;
  nhanKhau: NhanKhau | null; // Nhận vào một object nhân khẩu hoặc null
}

export default function NhanKhauDetailModal({ open, onClose, nhanKhau }: NhanKhauDetailModalProps) {
  if (!nhanKhau) {
    return null; // Không render gì nếu không có dữ liệu
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          Thông tin chi tiết Nhân khẩu
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {/* === THÔNG TIN CÁ NHÂN === */}
        <InfoRow label="Họ và tên" value={nhanKhau.hoTen} />
        <InfoRow label="Bí danh" value={nhanKhau.biDanh} />
        <InfoRow label="Ngày sinh" value={nhanKhau.ngaySinh} />
        <InfoRow label="Nơi sinh" value={nhanKhau.noiSinh} />
        <InfoRow label="Quê quán" value={nhanKhau.queQuan} />
        <InfoRow label="Dân tộc" value={nhanKhau.danToc} />
        
        <Divider sx={{ my: 1.5 }} />

        {/* === THÔNG TIN CĂN CƯỚC & NGHỀ NGHIỆP === */}
        <InfoRow label="Số CCCD" value={nhanKhau.cmndCccd} />
        <InfoRow label="Ngày cấp" value={nhanKhau.ngayCap} />
        <InfoRow label="Nơi cấp" value={nhanKhau.noiCap} />
        <InfoRow label="Nghề nghiệp" value={nhanKhau.ngheNghiep} />
        <InfoRow label="Nơi làm việc" value={nhanKhau.noiLamViec} />

        <Divider sx={{ my: 1.5 }} />

        {/* === THÔNG TIN CƯ TRÚ === */}
        <InfoRow label="Quan hệ với chủ hộ" value={nhanKhau.quanHeVoiChuHo} />
        <InfoRow label="Ngày ĐK thường trú" value={nhanKhau.ngayDangKyThuongTru} />
        <InfoRow label="Địa chỉ trước đây" value={nhanKhau.diaChiTruocKhiChuyenDen} />
      </DialogContent>
    </Dialog>
  );
}