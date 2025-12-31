import {
  Dialog, DialogTitle, DialogContent, Typography,
  Divider, IconButton, Box, CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { formatDate } from '../../utils/formatUtils';

// Extended interface for detail view
interface NhanKhau {
  id?: number;
  hoTen: string;
  biDanh?: string;
  ngaySinh: string;
  gioiTinh?: string;
  noiSinh?: string;
  queQuan?: string;
  danToc?: string;
  ngheNghiep?: string;
  noiLamViec?: string;
  cmndCccd?: string;
  ngayCap?: string;
  noiCap?: string;
  ngayDangKyThuongTru?: string;
  diaChiTruocKhiChuyenDen?: string;
  quanHeVoiChuHo: string;
  maHoKhau?: string;
  diaChiHoKhau?: string;
}

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
  loading: boolean;
}

export default function NhanKhauDetailModal({ open, onClose, nhanKhau, loading }: NhanKhauDetailModalProps) {

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
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
            <CircularProgress />
          </Box>
        ) : nhanKhau ? (
          <>
            {/* === THÔNG TIN CÁ NHÂN === */}
            <InfoRow label="Họ và tên" value={nhanKhau.hoTen} />
            <InfoRow label="Bí danh" value={nhanKhau.biDanh} />
            <InfoRow label="Ngày sinh" value={formatDate(nhanKhau.ngaySinh)} />
            <InfoRow label="Giới tính" value={nhanKhau.gioiTinh} />
            <InfoRow label="Nơi sinh" value={nhanKhau.noiSinh} />
            <InfoRow label="Quê quán" value={nhanKhau.queQuan} />
            <InfoRow label="Dân tộc" value={nhanKhau.danToc} />
            
            <Divider sx={{ my: 1.5 }} />

            {/* === THÔNG TIN CĂN CƯỚC & NGHỀ NGHIỆP === */}
            <InfoRow label="Số CCCD" value={nhanKhau.cmndCccd} />
            <InfoRow label="Ngày cấp" value={formatDate(nhanKhau.ngayCap)} />
            <InfoRow label="Nơi cấp" value={nhanKhau.noiCap} />
            <InfoRow label="Nghề nghiệp" value={nhanKhau.ngheNghiep} />
            <InfoRow label="Nơi làm việc" value={nhanKhau.noiLamViec} />

            <Divider sx={{ my: 1.5 }} />

            {/* === THÔNG TIN CƯ TRÚ === */}
            <InfoRow label="Quan hệ với chủ hộ" value={nhanKhau.quanHeVoiChuHo} />
            <InfoRow label="Ngày ĐK thường trú" value={formatDate(nhanKhau.ngayDangKyThuongTru)} />
            <InfoRow label="Địa chỉ trước đây" value={nhanKhau.diaChiTruocKhiChuyenDen} />
            <InfoRow label="Mã hộ khẩu" value={nhanKhau.maHoKhau} />
            <InfoRow label="Địa chỉ hộ khẩu" value={nhanKhau.diaChiHoKhau} />
          </>
        ) : (
          <Typography>Không có thông tin để hiển thị.</Typography>
        )}
      </DialogContent>
    </Dialog>
  );
}