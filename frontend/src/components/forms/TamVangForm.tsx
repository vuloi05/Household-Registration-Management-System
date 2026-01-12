// src/components/forms/TamVangForm.tsx
import { useTranslation } from 'react-i18next';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Box
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';

import { tamVangSchema } from '../../types/tamVang';
import type { TamVangFormValues } from '../../types/tamVang';

interface TamVangFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: TamVangFormValues) => void;
}

export default function TamVangForm({ open, onClose, onSubmit }: TamVangFormProps) {
  const { t } = useTranslation('tamVangTamTru');
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TamVangFormValues>({
    resolver: zodResolver(tamVangSchema),
  });

  useEffect(() => {
    if (open) {
      reset({ ngayBatDau: new Date().toISOString().split('T')[0] });
    }
  }, [open, reset]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>{t('form_title_tam_vang')}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gap: 2, mt: 2 }}>
            <Controller name="nhanKhauId" control={control} render={({ field }) => <TextField {...field} required label={t('form_label_nhan_khau_id')} type="number" error={!!errors.nhanKhauId} helperText={errors.nhanKhauId?.message} /> } />
            <Controller name="ngayBatDau" control={control} render={({ field }) => <TextField {...field} required label={t('form_label_ngay_bat_dau')} type="date" InputLabelProps={{ shrink: true }} error={!!errors.ngayBatDau} helperText={errors.ngayBatDau?.message} /> } />
            <Controller name="ngayKetThuc" control={control} render={({ field }) => <TextField {...field} required label={t('form_label_ngay_ket_thuc')} type="date" InputLabelProps={{ shrink: true }} error={!!errors.ngayKetThuc} helperText={errors.ngayKetThuc?.message} /> } />
            <Controller name="noiDen" control={control} render={({ field }) => <TextField {...field} label={t('form_label_noi_den')} /> } />
            <Controller name="lyDo" control={control} render={({ field }) => <TextField {...field} label={t('form_label_ly_do')} multiline rows={3} /> } />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>{t('cancel_button')}</Button>
          <Button type="submit" variant="contained">{t('save_button')}</Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
