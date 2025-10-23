// src/components/shared/SeparateHouseholdDialog.tsx

import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Typography, Divider, Alert
} from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';
import type { HouseholdCheckResult } from '../../api/nhanKhauApi';

interface SeparateHouseholdDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  householdInfo: HouseholdCheckResult | null;
  personName: string;
}

export default function SeparateHouseholdDialog({
  open,
  onClose,
  onConfirm,
  householdInfo,
  personName
}: SeparateHouseholdDialogProps) {
  if (!householdInfo) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <WarningIcon color="warning" />
        Xác nhận tách hộ
      </DialogTitle>

      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            Cảnh báo: Người này đang là thành viên của hộ khẩu khác!
          </Typography>
        </Alert>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Người được chọn:</strong> {personName}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Hiện đang thuộc hộ khẩu:</strong>
          </Typography>
          <Box sx={{ ml: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2">
              <strong>Mã hộ khẩu:</strong> {householdInfo.currentHousehold.maHoKhau}
            </Typography>
            <Typography variant="body2">
              <strong>Địa chỉ:</strong> {householdInfo.currentHousehold.diaChi}
            </Typography>
            <Typography variant="body2">
              <strong>Quan hệ:</strong> {householdInfo.personInfo.quanHeVoiChuHo}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="body2" color="text.secondary">
          Bạn có chắc chắn muốn tách người này ra khỏi hộ khẩu hiện tại và tạo hộ khẩu mới không?
          <br />
          <strong>Lưu ý:</strong> Hành động này sẽ chuyển người này từ hộ khẩu cũ sang hộ khẩu mới.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: '0 24px 16px' }}>
        <Button onClick={onClose} variant="outlined">
          Hủy bỏ
        </Button>
        <Button onClick={onConfirm} variant="contained" color="warning">
          Xác nhận tách hộ
        </Button>
      </DialogActions>
    </Dialog>
  );
}
