// src/components/forms/NhanKhauForm.tsx
import { useTranslation } from 'react-i18next';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Box, Divider, Typography,
  FormControl, InputLabel, Select, MenuItem,
  Tooltip
} from '@mui/material';
import { QrCodeScanner as QrCodeScannerIcon } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';

// Import schema và type đã được cập nhật đầy đủ các trường
import { nhanKhauSchema, nhanKhauWithMaHoKhauSchema } from '../../types/nhanKhau';
import type { NhanKhauFormValues } from '../../types/nhanKhau';
import QRPollingModal from '../shared/QRPollingModal';

interface NhanKhauFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: NhanKhauFormValues) => void;
  initialData?: NhanKhauFormValues | null;
  showMaHoKhauField?: boolean; // Prop để hiển thị ô nhập mã hộ khẩu
}

export default function NhanKhauForm({ open, onClose, onSubmit, initialData, showMaHoKhauField = false }: NhanKhauFormProps) {
  const { t } = useTranslation('nhanKhau');
  const isEditMode = !!initialData;
  const [qrPollingModalOpen, setQrPollingModalOpen] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<NhanKhauFormValues>({
    resolver: zodResolver(showMaHoKhauField ? nhanKhauWithMaHoKhauSchema : nhanKhauSchema),
  });

  useEffect(() => {
    // Reset form với giá trị mặc định hoặc dữ liệu cần sửa khi modal được mở
    if (open) {
      reset(initialData || {
        // Cung cấp giá trị mặc định cho TẤT CẢ các trường trong form
        hoTen: '',
        biDanh: '',
        ngaySinh: '',
        gioiTinh: '',
        noiSinh: '',
        queQuan: '',
        danToc: '',
        ngheNghiep: '',
        noiLamViec: '',
        cmndCccd: '',
        ngayCap: '',
        noiCap: '',
        ngayDangKyThuongTru: '',
        diaChiTruocKhiChuyenDen: '',
        quanHeVoiChuHo: '',
        maHoKhau: '',
      });
    }
  }, [initialData, open, reset]);

  // Hàm này giữ nguyên, không thay đổi
  const handleFormSubmit = (data: NhanKhauFormValues) => {
    onSubmit(data);
    // Không reset ở đây nữa để tránh form bị xóa trắng trước khi modal đóng
    // Việc reset đã được xử lý trong useEffect khi mở lại
  };

  const parseDateDDMMYYYYToISO = (raw: string): string => {
    const s = (raw || '').replace(/[^0-9]/g, '');
    if (s.length !== 8) return '';
    const dd = s.slice(0, 2);
    const mm = s.slice(2, 4);
    const yyyy = s.slice(4, 8);
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleQRSuccess = (decodedText: string) => {
    const parts = (decodedText || '').split('|').map(p => p.trim());
    const cccd = parts[0] || '';
    const hoTen = parts[2] || '';
    const ngaySinhISO = parseDateDDMMYYYYToISO(parts[3] || '');
    const gioiTinh = parts[4] === 'Nam' || parts[4] === 'Nữ' ? parts[4] : '';
    const diaChi = parts[5] || '';
    const ngayCapISO = parseDateDDMMYYYYToISO(parts[6] || '');

    if (cccd) setValue('cmndCccd', cccd, { shouldValidate: true });
    if (hoTen) setValue('hoTen', hoTen, { shouldValidate: true });
    if (ngaySinhISO) setValue('ngaySinh', ngaySinhISO, { shouldValidate: true });
    if (gioiTinh) setValue('gioiTinh', gioiTinh, { shouldValidate: true });
    // Lấy tỉnh/thành (sau dấu phẩy cuối cùng) làm "Quê quán"
    if (diaChi) {
      const lastSegment = diaChi.split(',').pop()?.trim() || '';
      setValue('queQuan', lastSegment);
    }
    if (ngayCapISO) setValue('ngayCap', ngayCapISO, { shouldValidate: true });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <Box component="form" onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" component="div">
            {isEditMode ? t('form_edit_title') : t('form_add_title')}
          </Typography>
          <Tooltip title={t('form_scan_from_appsheet')}>
            <Button size="small" variant="outlined" startIcon={<QrCodeScannerIcon fontSize="small" />} onClick={() => setQrPollingModalOpen(true)}>
              {t('form_scan_qr')}
            </Button>
          </Tooltip>
        </DialogTitle>
        <DialogContent>
          
          {/* === THÔNG TIN CÁ NHÂN === */}
          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>{t('form_section_personal')}</Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', // Layout responsive
              gap: 2,
            }}
          >
            <Controller name="hoTen" control={control} render={({ field }) => ( <TextField {...field} autoFocus required label={t('label_fullname')} error={!!errors.hoTen} helperText={errors.hoTen?.message} /> )} />
            <Controller name="biDanh" control={control} render={({ field }) => ( <TextField {...field} label={t('label_alias')} /> )} />
            <Controller name="ngaySinh" control={control} render={({ field }) => ( <TextField {...field} required label={t('label_dob')} type="date" InputLabelProps={{ shrink: true }} error={!!errors.ngaySinh} helperText={errors.ngaySinh?.message} /> )} />
            <Controller 
              name="gioiTinh" 
              control={control} 
              render={({ field }) => ( 
                <FormControl fullWidth>
                  <InputLabel>{t('label_gender')}</InputLabel>
                  <Select {...field} label={t('label_gender')}>
                    <MenuItem value="">{t('form_select_gender')}</MenuItem>
                    <MenuItem value="Nam">{t('gender_male')}</MenuItem>
                    <MenuItem value="Nữ">{t('gender_female')}</MenuItem>
                  </Select>
                </FormControl>
              )} 
            />
            <Controller name="noiSinh" control={control} render={({ field }) => ( <TextField {...field} label={t('label_pob')} /> )} />
            <Controller name="queQuan" control={control} render={({ field }) => ( <TextField {...field} label={t('label_hometown')} /> )} />
            <Controller name="danToc" control={control} render={({ field }) => ( <TextField {...field} label={t('label_ethnicity')} /> )} />
          </Box>
          
          <Divider sx={{ my: 3 }} />

          {/* === THÔNG TIN CĂN CƯỚC & NGHỀ NGHIỆP === */}
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>{t('form_section_id_job')}</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2, }}>
            <Controller 
              name="cmndCccd" 
              control={control} 
              render={({ field }) => ( 
                <TextField 
                  {...field} 
                  required 
                  label={t('label_cccd_number')} 
                  error={!!errors.cmndCccd} 
                  helperText={errors.cmndCccd?.message}
                /> 
              )} 
            />
            <Controller name="ngayCap" control={control} render={({ field }) => ( <TextField {...field} required label={t('label_issue_date')} type="date" InputLabelProps={{ shrink: true }} error={!!errors.ngayCap} helperText={errors.ngayCap?.message} /> )} />
            <Controller name="noiCap" control={control} render={({ field }) => ( <TextField {...field} required label={t('label_issue_place')} error={!!errors.noiCap} helperText={errors.noiCap?.message} /> )} />
            <Controller name="ngheNghiep" control={control} render={({ field }) => ( <TextField {...field} label={t('label_job')} /> )} />
            <Controller name="noiLamViec" control={control} render={({ field }) => ( <TextField {...field} label={t('label_workplace')} /> )} />
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* === THÔNG TIN CƯ TRÚ === */}
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>{t('form_section_residence')}</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2, }}>
            {showMaHoKhauField && (
              <Controller 
                name="maHoKhau" 
                control={control} 
                render={({ field }) => ( 
                  <TextField 
                    {...field} 
                    required 
                    label={t('label_household_code')} 
                    error={!!errors.maHoKhau} 
                    helperText={errors.maHoKhau?.message || t('form_helper_household_code')} 
                  /> 
                )} 
              />
            )}
            <Controller name="quanHeVoiChuHo" control={control} render={({ field }) => ( <TextField {...field} required label={t('label_relationship_with_holder')} error={!!errors.quanHeVoiChuHo} helperText={errors.quanHeVoiChuHo?.message} /> )} />
            <Controller name="ngayDangKyThuongTru" control={control} render={({ field }) => ( <TextField {...field} label={t('label_registration_date')} type="date" InputLabelProps={{ shrink: true }} /> )} />
            <Controller name="diaChiTruocKhiChuyenDen" control={control} render={({ field }) => ( <TextField {...field} label={t('label_previous_address')} /> )} />
          </Box>

        </DialogContent>
        <DialogActions sx={{ p: '0 24px 16px' }}>
          <Button onClick={onClose}>{t('form_button_cancel')}</Button>
          <Button type="submit" variant="contained">{t('form_button_save')}</Button>
        </DialogActions>
        <QRPollingModal open={qrPollingModalOpen} onClose={() => setQrPollingModalOpen(false)} onReceiveQRCode={handleQRSuccess} />
      </Box>
    </Dialog>
  );
}