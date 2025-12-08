// src/components/forms/NhanKhauForm.tsx

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
            {isEditMode ? 'Cập nhật Nhân khẩu' : 'Thêm Nhân khẩu mới'}
          </Typography>
          <Tooltip title="Quét từ AppSheet">
            <Button size="small" variant="outlined" startIcon={<QrCodeScannerIcon fontSize="small" />} onClick={() => setQrPollingModalOpen(true)}>
              Quét QR
            </Button>
          </Tooltip>
        </DialogTitle>
        <DialogContent>
          
          {/* === THÔNG TIN CÁ NHÂN === */}
          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>Thông tin cá nhân</Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', // Layout responsive
              gap: 2,
            }}
          >
            <Controller name="hoTen" control={control} render={({ field }) => ( <TextField {...field} autoFocus required label="Họ và Tên" error={!!errors.hoTen} helperText={errors.hoTen?.message} /> )} />
            <Controller name="biDanh" control={control} render={({ field }) => ( <TextField {...field} label="Bí danh" /> )} />
            <Controller name="ngaySinh" control={control} render={({ field }) => ( <TextField {...field} required label="Ngày sinh" type="date" InputLabelProps={{ shrink: true }} error={!!errors.ngaySinh} helperText={errors.ngaySinh?.message} /> )} />
            <Controller 
              name="gioiTinh" 
              control={control} 
              render={({ field }) => ( 
                <FormControl fullWidth>
                  <InputLabel>Giới tính</InputLabel>
                  <Select {...field} label="Giới tính">
                    <MenuItem value="">Chọn giới tính</MenuItem>
                    <MenuItem value="Nam">Nam</MenuItem>
                    <MenuItem value="Nữ">Nữ</MenuItem>
                  </Select>
                </FormControl>
              )} 
            />
            <Controller name="noiSinh" control={control} render={({ field }) => ( <TextField {...field} label="Nơi sinh" /> )} />
            <Controller name="queQuan" control={control} render={({ field }) => ( <TextField {...field} label="Quê quán" /> )} />
            <Controller name="danToc" control={control} render={({ field }) => ( <TextField {...field} label="Dân tộc" /> )} />
          </Box>
          
          <Divider sx={{ my: 3 }} />

          {/* === THÔNG TIN CĂN CƯỚC & NGHỀ NGHIỆP === */}
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>Thông tin Căn cước & Nghề nghiệp</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2, }}>
            <Controller 
              name="cmndCccd" 
              control={control} 
              render={({ field }) => ( 
                <TextField 
                  {...field} 
                  required 
                  label="Số CMND/CCCD" 
                  error={!!errors.cmndCccd} 
                  helperText={errors.cmndCccd?.message}
                /> 
              )} 
            />
            <Controller name="ngayCap" control={control} render={({ field }) => ( <TextField {...field} required label="Ngày cấp" type="date" InputLabelProps={{ shrink: true }} error={!!errors.ngayCap} helperText={errors.ngayCap?.message} /> )} />
            <Controller name="noiCap" control={control} render={({ field }) => ( <TextField {...field} required label="Nơi cấp" error={!!errors.noiCap} helperText={errors.noiCap?.message} /> )} />
            <Controller name="ngheNghiep" control={control} render={({ field }) => ( <TextField {...field} label="Nghề nghiệp" /> )} />
            <Controller name="noiLamViec" control={control} render={({ field }) => ( <TextField {...field} label="Nơi làm việc" /> )} />
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* === THÔNG TIN CƯ TRÚ === */}
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>Thông tin Cư trú</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2, }}>
            {showMaHoKhauField && (
              <Controller 
                name="maHoKhau" 
                control={control} 
                render={({ field }) => ( 
                  <TextField 
                    {...field} 
                    required 
                    label="Mã hộ khẩu" 
                    error={!!errors.maHoKhau} 
                    helperText={errors.maHoKhau?.message || 'Nhập mã hộ khẩu để thêm nhân khẩu vào hộ'} 
                  /> 
                )} 
              />
            )}
            <Controller name="quanHeVoiChuHo" control={control} render={({ field }) => ( <TextField {...field} required label="Quan hệ với chủ hộ" error={!!errors.quanHeVoiChuHo} helperText={errors.quanHeVoiChuHo?.message} /> )} />
            <Controller name="ngayDangKyThuongTru" control={control} render={({ field }) => ( <TextField {...field} label="Ngày ĐK thường trú" type="date" InputLabelProps={{ shrink: true }} /> )} />
            <Controller name="diaChiTruocKhiChuyenDen" control={control} render={({ field }) => ( <TextField {...field} label="Địa chỉ trước đây" /> )} />
          </Box>

        </DialogContent>
        <DialogActions sx={{ p: '0 24px 16px' }}>
          <Button onClick={onClose}>Hủy</Button>
          <Button type="submit" variant="contained">Lưu</Button>
        </DialogActions>
        <QRPollingModal open={qrPollingModalOpen} onClose={() => setQrPollingModalOpen(false)} onReceiveQRCode={handleQRSuccess} />
      </Box>
    </Dialog>
  );
}