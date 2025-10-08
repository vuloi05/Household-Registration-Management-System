// src/components/forms/HoKhauForm.tsx

import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Box
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form'; // 1. Import hook từ react-hook-form
import { zodResolver } from '@hookform/resolvers/zod'; // 2. Import resolver
import { useEffect } from 'react';

import { hoKhauSchema } from '../../types/hoKhau'; // Import giá trị
import type { HoKhauFormValues } from '../../types/hoKhau'; // Import type với từ khóa 'type'

interface HoKhauFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: HoKhauFormValues) => void; // 4. Prop mới để xử lý submit
  initialData?: HoKhauFormValues | null; // 2. Prop mới để nhận dữ liệu cần sửa (có thể null)
}

export default function HoKhauForm({ open, onClose, onSubmit, initialData }: HoKhauFormProps) {
  const isEditMode = !!initialData; // Kiểm tra xem có phải chế độ sửa không

  // 5. Khởi tạo react-hook-form
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset, // 3. Lấy hàm reset từ useForm
  } = useForm<HoKhauFormValues>({
    resolver: zodResolver(hoKhauSchema), // Tích hợp Zod để validation
    defaultValues: initialData || { // Giá trị mặc định cho form
      maHoKhau: '',
      chuHo: '',
      diaChi: '',
    },
  });

  // 4. Sử dụng useEffect để cập nhật lại form khi initialData thay đổi
  useEffect(() => {
    if (open) {
      reset(initialData || { maHoKhau: '', chuHo: '', diaChi: '' });
    }
  }, [initialData, open, reset]);

  const handleFormSubmitWithReset = (data: HoKhauFormValues) => {
    onSubmit(data);
    reset(); // Reset form sau khi submit
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      {/* 6. Sử dụng handleSubmit của react-hook-form */}
      <Box component="form" onSubmit={handleSubmit(handleFormSubmitWithReset)}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {/* Sửa lại để dùng isEditMode */}
          {isEditMode ? 'Cập nhật Hộ khẩu' : 'Thêm Hộ khẩu mới'}
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              mt: 2,
            }}
          >
            <Box sx={{ display: 'flex', gap: 2 }}>
              {/* 7. Bọc TextField trong Controller */}
              <Controller
                name="maHoKhau"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    autoFocus
                    required
                    label="Mã Hộ khẩu"
                    fullWidth
                    variant="outlined"
                    error={!!errors.maHoKhau}
                    helperText={errors.maHoKhau?.message}
                  />
                )}
              />
              <Controller
                name="chuHo"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    required
                    label="Họ tên Chủ hộ"
                    fullWidth
                    variant="outlined"
                    error={!!errors.chuHo}
                    helperText={errors.chuHo?.message}
                  />
                )}
              />
            </Box>
            <Controller
              name="diaChi"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  required
                  label="Địa chỉ"
                  fullWidth
                  variant="outlined"
                  error={!!errors.diaChi}
                  helperText={errors.diaChi?.message}
                />
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