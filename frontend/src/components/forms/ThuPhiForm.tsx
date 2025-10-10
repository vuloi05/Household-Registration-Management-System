// src/components/forms/ThuPhiForm.tsx

import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Box, MenuItem
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';

import { thuPhiSchema, LoaiPhi, TrangThaiPhi } from '../../types/thuPhi';
import type { ThuPhiFormValues } from '../../types/thuPhi';

interface ThuPhiFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ThuPhiFormValues) => void;
  initialData?: ThuPhiFormValues | null;
}

export default function ThuPhiForm({ open, onClose, onSubmit, initialData }: ThuPhiFormProps) {
  const isEditMode = !!initialData;

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ThuPhiFormValues>({
    resolver: zodResolver(thuPhiSchema),
    defaultValues: initialData || {
      tenPhi: '',
      moTa: '',
      soTien: 0,
      ngayThu: '',
      loaiPhi: 'KHAC',
      trangThai: 'CHUA_THU',
    },
  });

  useEffect(() => {
    if (open) {
      reset(initialData || {
        tenPhi: '',
        moTa: '',
        soTien: 0,
        ngayThu: '',
        loaiPhi: 'KHAC',
        trangThai: 'CHUA_THU',
      });
    }
  }, [initialData, open, reset]);

  const handleFormSubmitWithReset = (data: ThuPhiFormValues) => {
    onSubmit(data);
    reset();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <Box component="form" onSubmit={handleSubmit(handleFormSubmitWithReset)}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {isEditMode ? 'Cập nhật Thu phí' : 'Thêm Thu phí mới'}
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
              <Controller
                name="tenPhi"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    autoFocus
                    required
                    label="Tên phí"
                    fullWidth
                    variant="outlined"
                    error={!!errors.tenPhi}
                    helperText={errors.tenPhi?.message}
                  />
                )}
              />
              <Controller
                name="soTien"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    required
                    label="Số tiền (VNĐ)"
                    fullWidth
                    variant="outlined"
                    type="number"
                    error={!!errors.soTien}
                    helperText={errors.soTien?.message}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Controller
                name="loaiPhi"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    required
                    select
                    label="Loại phí"
                    fullWidth
                    variant="outlined"
                    error={!!errors.loaiPhi}
                    helperText={errors.loaiPhi?.message}
                  >
                    {Object.entries(LoaiPhi).map(([key, label]) => (
                      <MenuItem key={key} value={key}>
                        {label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
              <Controller
                name="trangThai"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    required
                    select
                    label="Trạng thái"
                    fullWidth
                    variant="outlined"
                    error={!!errors.trangThai}
                    helperText={errors.trangThai?.message}
                  >
                    {Object.entries(TrangThaiPhi).map(([key, label]) => (
                      <MenuItem key={key} value={key}>
                        {label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Box>
            <Controller
              name="ngayThu"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  required
                  label="Ngày thu"
                  fullWidth
                  variant="outlined"
                  type="date"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  error={!!errors.ngayThu}
                  helperText={errors.ngayThu?.message}
                />
              )}
            />
            <Controller
              name="moTa"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  required
                  label="Mô tả"
                  fullWidth
                  variant="outlined"
                  multiline
                  rows={3}
                  error={!!errors.moTa}
                  helperText={errors.moTa?.message}
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