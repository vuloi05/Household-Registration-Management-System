// src/components/shared/ConfirmationDialog.tsx
import { useTranslation } from 'react-i18next';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

interface ConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export default function ConfirmationDialog({ open, onClose, onConfirm, title, message }: ConfirmationDialogProps) {
  const { t } = useTranslation('common');

  return (
    <Dialog
      open={open}
      onClose={onClose}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('cancel')}</Button>
        <Button onClick={onConfirm} color="primary" autoFocus>
          {t('confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}