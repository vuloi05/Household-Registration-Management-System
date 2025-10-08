// src/components/forms/NhanKhauForm.tsx

import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Box
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';

// Import schema và type chúng ta vừa tạo
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
        hoTen: '',
        ngaySinh: '',
        cmndCccd: '',
        quanHeVoiChuHo: '',
        queQuan: '',
        danToc: '',
        ngheNghiep: '',
      });
    }
  }, [initialData, open, reset]);

  const handleFormSubmit = (data: NhanKhauFormValues) => {
    onSubmit(data);
    reset();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <Box component="form" onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {isEditMode ? 'Cập nhật Nhân khẩu' : 'Thêm Nhân khẩu mới'}
        </DialogTitle>
        <DialogContent>
          {/* Layout form với 2 cột */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr', // 2 cột bằng nhau
              gap: 2,
              mt: 2,
            }}
          >
            <Controller
              name="hoTen"
              control={control}
              render={({ field }) => (
                <TextField {...field} autoFocus required label="Họ và Tên" error={!!errors.hoTen} helperText={errors.hoTen?.message} />
              )}
            />
            <Controller
              name="ngaySinh"
              control={control}
              render={({ field }) => (
                <TextField {...field} required label="Ngày sinh" placeholder="YYYY-MM-DD" error={!!errors.ngaySinh} helperText={errors.ngaySinh?.message} />
              )}
            />
            <Controller
              name="quanHeVoiChuHo"
              control={control}
              render={({ field }) => (
                <TextField {...field} required label="Quan hệ với chủ hộ" error={!!errors.quanHeVoiChuHo} helperText={errors.quanHeVoiChuHo?.message} />
              )}
            />
            <Controller
              name="cmndCccd"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Số CMND/CCCD" error={!!errors.cmndCccd} helperText={errors.cmndCccd?.message} />
              )}
            />
            <Controller
              name="queQuan"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Quê quán" error={!!errors.queQuan} helperText={errors.queQuan?.message} />
              )}
            />
             <Controller
              name="danToc"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Dân tộc" error={!!errors.danToc} helperText={errors.danToc?.message} />
              )}
            />
             <Controller
              name="ngheNghiep"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Nghề nghiệp" error={!!errors.ngheNghiep} helperText={errors.ngheNghiep?.message} />
              )}
            />
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