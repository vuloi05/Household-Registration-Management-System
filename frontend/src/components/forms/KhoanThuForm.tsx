// src/components/forms/KhoanThuForm.tsx
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  Box, FormControl, InputLabel, Select, MenuItem, FormHelperText
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { khoanThuSchema } from '../../types/khoanThu';
import type { KhoanThuFormValues } from '../../api/khoanThuApi';

interface KhoanThuFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: KhoanThuFormValues) => void;
}

export default function KhoanThuForm({ open, onClose, onSubmit }: KhoanThuFormProps) {
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<KhoanThuFormValues>({
    resolver: zodResolver(khoanThuSchema),
  });

  const loaiKhoanThuValue = watch('loaiKhoanThu');
  useEffect(() => { if(open) reset() }, [open, reset]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Tạo Khoản thu mới</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            <Controller name="tenKhoanThu" control={control} render={({ field }) => ( <TextField {...field} autoFocus required label="Tên khoản thu" error={!!errors.tenKhoanThu} helperText={errors.tenKhoanThu?.message} /> )}/>
            <Controller name="loaiKhoanThu" control={control} render={({ field }) => (
                <FormControl fullWidth required error={!!errors.loaiKhoanThu}>
                  <InputLabel>Loại khoản thu</InputLabel>
                  <Select {...field} label="Loại khoản thu" defaultValue="">
                    <MenuItem value="BAT_BUOC">Bắt buộc</MenuItem>
                    <MenuItem value="DONG_GOP">Đóng góp</MenuItem>
                  </Select>
                  {errors.loaiKhoanThu && <FormHelperText>{errors.loaiKhoanThu.message}</FormHelperText>}
                </FormControl>
            )}/>
            {loaiKhoanThuValue === 'BAT_BUOC' && (
              <Controller name="soTienTrenMotNhanKhau" control={control} render={({ field }) => (
                <TextField 
                    {...field}
                    onChange={e => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                    required 
                    type="number" 
                    label="Đơn giá / Nhân khẩu (VNĐ)" 
                    error={!!errors.soTienTrenMotNhanKhau} 
                    helperText={errors.soTienTrenMotNhanKhau?.message} 
                />
              )}/>
            )}
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