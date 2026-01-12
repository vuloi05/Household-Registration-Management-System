// src/components/forms/TamTruForm.tsx
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('tamVangTamTru');
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
        <DialogTitle>{t('form_title_tam_tru')}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mt: 2 }}>
            <Controller name="hoTen" control={control} render={({ field }) => <TextField {...field} required label={t('form_label_ho_ten')} error={!!errors.hoTen} helperText={errors.hoTen?.message} /> } />
            <Controller name="ngaySinh" control={control} render={({ field }) => <TextField {...field} label={t('form_label_ngay_sinh')} type="date" InputLabelProps={{ shrink: true }} /> } />
            <Controller name="gioiTinh" control={control} render={({ field }) => <TextField {...field} label={t('form_label_gioi_tinh')} /> } />
            <Controller name="cmndCccd" control={control} render={({ field }) => <TextField {...field} label={t('form_label_cmnd_cccd')} /> } />
            <Controller name="noiThuongTru" control={control} render={({ field }) => <TextField {...field} label={t('form_label_noi_thuong_tru')} /> } />
            <Controller name="hoKhauTiepNhanId" control={control} render={({ field }) => <TextField {...field} required label={t('form_label_ho_khau_id')} type="number" error={!!errors.hoKhauTiepNhanId} helperText={errors.hoKhauTiepNhanId?.message} /> } />
            <Controller name="ngayBatDau" control={control} render={({ field }) => <TextField {...field} required label={t('form_label_ngay_bat_dau')} type="date" InputLabelProps={{ shrink: true }} error={!!errors.ngayBatDau} helperText={errors.ngayBatDau?.message} /> } />
            <Controller name="ngayKetThuc" control={control} render={({ field }) => <TextField {...field} required label={t('form_label_ngay_ket_thuc')} type="date" InputLabelProps={{ shrink: true }} error={!!errors.ngayKetThuc} helperText={errors.ngayKetThuc?.message} /> } />
            <Controller name="lyDo" control={control} render={({ field }) => <TextField {...field} label={t('form_label_ly_do')} multiline rows={3} sx={{ gridColumn: 'span 2' }}/> } />
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
