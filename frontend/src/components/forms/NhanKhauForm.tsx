// src/components/forms/NhanKhauForm.tsx

import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Box, Divider, Typography
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';

// Import schema và type đã được cập nhật đầy đủ các trường
import { nhanKhauSchema } from '../../types/nhanKhau';
import type { NhanKhauFormValues } from '../../types/nhanKhau';

interface NhanKhauFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: NhanKhauFormValues) => void;
  initialData?: NhanKhauFormValues | null;
}

export default function NhanKhauForm({ open, onClose, onSubmit, initialData }: NhanKhauFormProps) {
  const isEditMode = !!initialData;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NhanKhauFormValues>({
    resolver: zodResolver(nhanKhauSchema),
  });

  useEffect(() => {
    // Reset form với giá trị mặc định hoặc dữ liệu cần sửa khi modal được mở
    if (open) {
      reset(initialData || {
        // Cung cấp giá trị mặc định cho TẤT CẢ các trường trong form
        hoTen: '',
        biDanh: '',
        ngaySinh: '',
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
      });
    }
  }, [initialData, open, reset]);

  // Hàm này giữ nguyên, không thay đổi
  const handleFormSubmit = (data: NhanKhauFormValues) => {
    onSubmit(data);
    // Không reset ở đây nữa để tránh form bị xóa trắng trước khi modal đóng
    // Việc reset đã được xử lý trong useEffect khi mở lại
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <Box component="form" onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {isEditMode ? 'Cập nhật Nhân khẩu' : 'Thêm Nhân khẩu mới'}
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
            <Controller name="noiSinh" control={control} render={({ field }) => ( <TextField {...field} label="Nơi sinh" /> )} />
            <Controller name="queQuan" control={control} render={({ field }) => ( <TextField {...field} label="Quê quán" /> )} />
            <Controller name="danToc" control={control} render={({ field }) => ( <TextField {...field} label="Dân tộc" /> )} />
          </Box>
          
          <Divider sx={{ my: 3 }} />

          {/* === THÔNG TIN CĂN CƯỚC & NGHỀ NGHIỆP === */}
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>Thông tin Căn cước & Nghề nghiệp</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2, }}>
            <Controller name="cmndCccd" control={control} render={({ field }) => ( <TextField {...field} label="Số CMND/CCCD" /> )} />
            <Controller name="ngayCap" control={control} render={({ field }) => ( <TextField {...field} label="Ngày cấp" type="date" InputLabelProps={{ shrink: true }} /> )} />
            <Controller name="noiCap" control={control} render={({ field }) => ( <TextField {...field} label="Nơi cấp" /> )} />
            <Controller name="ngheNghiep" control={control} render={({ field }) => ( <TextField {...field} label="Nghề nghiệp" /> )} />
            <Controller name="noiLamViec" control={control} render={({ field }) => ( <TextField {...field} label="Nơi làm việc" /> )} />
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* === THÔNG TIN CƯ TRÚ === */}
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>Thông tin Cư trú</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2, }}>
            <Controller name="quanHeVoiChuHo" control={control} render={({ field }) => ( <TextField {...field} required label="Quan hệ với chủ hộ" error={!!errors.quanHeVoiChuHo} helperText={errors.quanHeVoiChuHo?.message} /> )} />
            <Controller name="ngayDangKyThuongTru" control={control} render={({ field }) => ( <TextField {...field} label="Ngày ĐK thường trú" type="date" InputLabelProps={{ shrink: true }} /> )} />
            <Controller name="diaChiTruocKhiChuyenDen" control={control} render={({ field }) => ( <TextField {...field} label="Địa chỉ trước đây" /> )} />
          </Box>

        </DialogContent>
        <DialogActions sx={{ p: '0 24px 16px' }}>
          <Button onClick={onClose}>Hủy</Button>
          <Button type="submit" variant="contained">Lưu</Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}