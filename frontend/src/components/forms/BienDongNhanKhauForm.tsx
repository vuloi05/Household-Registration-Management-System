// src/components/forms/BienDongNhanKhauForm.tsx

import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Box,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';

import { bienDongNhanKhauSchema } from '../../types/bienDong';
import type { BienDongNhanKhauFormValues } from '../../types/bienDong';

interface BienDongNhanKhauFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: BienDongNhanKhauFormValues) => void;
  nhanKhauId: number;
}

export default function BienDongNhanKhauForm({ open, onClose, onSubmit, nhanKhauId }: BienDongNhanKhauFormProps) {
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<BienDongNhanKhauFormValues>({
    resolver: zodResolver(bienDongNhanKhauSchema),
    defaultValues: {
      nhanKhauId,
      loaiBienDong: '',
      ngayBienDong: '',
      noiChuyenDen: '',
      lyDo: '',
      ghiChu: '',
    }
  });

  const loaiBienDong = watch("loaiBienDong");

  useEffect(() => {
    if (open) {
      reset({
        nhanKhauId,
        loaiBienDong: '',
        ngayBienDong: new Date().toISOString().split('T')[0],
        noiChuyenDen: '',
        lyDo: '',
        ghiChu: '',
      });
    }
  }, [open, reset, nhanKhauId]);

  const handleFormSubmit = (data: BienDongNhanKhauFormValues) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Box component="form" onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Ghi nhận Biến động Nhân khẩu</DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: 2,
              mt: 2,
            }}
          >
            <Controller
              name="loaiBienDong"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth required error={!!errors.loaiBienDong}>
                  <InputLabel>Loại biến động</InputLabel>
                  <Select {...field} label="Loại biến động">
                    <MenuItem value="CHUYEN_DI">Chuyển đi</MenuItem>
                    <MenuItem value="QUA_DOI">Qua đời</MenuItem>
                    <MenuItem value="TAM_VANG">Tạm vắng</MenuItem>
                  </Select>
                </FormControl>
              )}
            />

            <Controller
              name="ngayBienDong"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  required
                  label="Ngày biến động"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.ngayBienDong}
                  helperText={errors.ngayBienDong?.message}
                />
              )}
            />

            {loaiBienDong === 'CHUYEN_DI' && (
              <Controller
                name="noiChuyenDen"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Nơi chuyển đến"
                    fullWidth
                  />
                )}
              />
            )}

            <Controller
              name="lyDo"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Lý do"
                  fullWidth
                  multiline
                  rows={2}
                />
              )}
            />

            <Controller
              name="ghiChu"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Ghi chú"
                  fullWidth
                  multiline
                  rows={2}
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
