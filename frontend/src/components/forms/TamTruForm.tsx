// src/components/forms/TamTruForm.tsx

import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Box
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';

import { tamTruSchema } from '../../types/tamTru';
import type { TamTruFormValues } from '../../types/tamTru';

interface TamTruFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: TamTruFormValues) => void;
}

export default function TamTruForm({ open, onClose, onSubmit }: TamTruFormProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TamTruFormValues>({
    resolver: zodResolver(tamTruSchema),
  });

  useEffect(() => {
    if (open) {
      reset({ ngayBatDau: new Date().toISOString().split('T')[0] });
    }
  }, [open, reset]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>Thêm Tạm trú</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mt: 2 }}>
            <Controller name="hoTen" control={control} render={({ field }) => <TextField {...field} required label="Họ và tên" error={!!errors.hoTen} helperText={errors.hoTen?.message} /> } />
            <Controller name="ngaySinh" control={control} render={({ field }) => <TextField {...field} label="Ngày sinh" type="date" InputLabelProps={{ shrink: true }} /> } />
            <Controller name="gioiTinh" control={control} render={({ field }) => <TextField {...field} label="Giới tính" /> } />
            <Controller name="cmndCccd" control={control} render={({ field }) => <TextField {...field} label="CMND/CCCD" /> } />
            <Controller name="noiThuongTru" control={control} render={({ field }) => <TextField {...field} label="Nơi thường trú" /> } />
            <Controller name="hoKhauTiepNhanId" control={control} render={({ field }) => <TextField {...field} required label="ID Hộ khẩu tiếp nhận" type="number" error={!!errors.hoKhauTiepNhanId} helperText={errors.hoKhauTiepNhanId?.message} /> } />
            <Controller name="ngayBatDau" control={control} render={({ field }) => <TextField {...field} required label="Ngày bắt đầu" type="date" InputLabelProps={{ shrink: true }} error={!!errors.ngayBatDau} helperText={errors.ngayBatDau?.message} /> } />
            <Controller name="ngayKetThuc" control={control} render={({ field }) => <TextField {...field} required label="Ngày kết thúc" type="date" InputLabelProps={{ shrink: true }} error={!!errors.ngayKetThuc} helperText={errors.ngayKetThuc?.message} /> } />
            <Controller name="lyDo" control={control} render={({ field }) => <TextField {...field} label="Lý do" multiline rows={3} sx={{ gridColumn: 'span 2' }}/> } />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Hủy</Button>
          <Button type="submit" variant="contained">Lưu</Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
