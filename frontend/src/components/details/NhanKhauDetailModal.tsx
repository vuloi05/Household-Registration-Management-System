import {
  Dialog, DialogTitle, DialogContent, Typography,
  Divider, IconButton, Box, CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
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
const InfoRow = ({ label, value, noInfoText }: { label: string, value: string | null | undefined, noInfoText: string }) => (
  <Box sx={{ display: 'flex', py: 0.75 }}>
    <Box sx={{ width: '40%', minWidth: '150px' }}>
      <Typography variant="body2" color="text.secondary">{label}:</Typography>
    </Box>
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="body1" sx={{ fontWeight: 500 }}>
        {value || noInfoText}
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
  const { t } = useTranslation('nhanKhau');

  const getGenderLabel = (gender: string | undefined) => {
    if (gender === 'Nam') return t('gender_male');
    if (gender === 'Nữ') return t('gender_female');
    return undefined;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          {t('detail_modal_title')}
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
            <InfoRow label={t('label_fullname')} value={nhanKhau.hoTen} noInfoText={t('no_info')} />
            <InfoRow label={t('label_alias')} value={nhanKhau.biDanh} noInfoText={t('no_info')} />
            <InfoRow label={t('label_dob')} value={formatDate(nhanKhau.ngaySinh)} noInfoText={t('no_info')} />
            <InfoRow label={t('label_gender')} value={getGenderLabel(nhanKhau.gioiTinh)} noInfoText={t('no_info')} />
            <InfoRow label={t('label_pob')} value={nhanKhau.noiSinh} noInfoText={t('no_info')} />
            <InfoRow label={t('label_hometown')} value={nhanKhau.queQuan} noInfoText={t('no_info')} />
            <InfoRow label={t('label_ethnicity')} value={nhanKhau.danToc} noInfoText={t('no_info')} />
            
            <Divider sx={{ my: 1.5 }} />

            {/* === THÔNG TIN CĂN CƯỚC & NGHỀ NGHIỆP === */}
            <InfoRow label={t('label_cccd_number')} value={nhanKhau.cmndCccd} noInfoText={t('no_info')} />
            <InfoRow label={t('label_issue_date')} value={formatDate(nhanKhau.ngayCap)} noInfoText={t('no_info')} />
            <InfoRow label={t('label_issue_place')} value={nhanKhau.noiCap} noInfoText={t('no_info')} />
            <InfoRow label={t('label_job')} value={nhanKhau.ngheNghiep} noInfoText={t('no_info')} />
            <InfoRow label={t('label_workplace')} value={nhanKhau.noiLamViec} noInfoText={t('no_info')} />

            <Divider sx={{ my: 1.5 }} />

            {/* === THÔNG TIN CƯ TRÚ === */}
            <InfoRow label={t('label_relationship_with_holder')} value={nhanKhau.quanHeVoiChuHo} noInfoText={t('no_info')} />
            <InfoRow label={t('label_registration_date')} value={formatDate(nhanKhau.ngayDangKyThuongTru)} noInfoText={t('no_info')} />
            <InfoRow label={t('label_previous_address')} value={nhanKhau.diaChiTruocKhiChuyenDen} noInfoText={t('no_info')} />
            <InfoRow label={t('label_household_code')} value={nhanKhau.maHoKhau} noInfoText={t('no_info')} />
            <InfoRow label={t('label_household_address')} value={nhanKhau.diaChiHoKhau} noInfoText={t('no_info')} />
          </>
        ) : (
          <Typography>{t('no_info_to_display')}</Typography>
        )}
      </DialogContent>
    </Dialog>
  );
}