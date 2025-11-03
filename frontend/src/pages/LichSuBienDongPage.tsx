// src/pages/LichSuBienDongPage.tsx

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import { useSnackbar } from 'notistack';

import { getAllBienDong } from '../api/bienDongApi';
import type { BienDongNhanKhauDTO } from '../types/bienDong';

export default function LichSuBienDongPage() {
  const { enqueueSnackbar } = useSnackbar();

  const [lichSuList, setLichSuList] = useState<BienDongNhanKhauDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getAllBienDong()
      .then(response => {
        // Giả sử response.data là một mảng các object
        setLichSuList(response.data);
      })
      .catch(error => {
        console.error('Error fetching lich su bien dong:', error);
        enqueueSnackbar('Không thể tải lịch sử biến động.', { variant: 'error' });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [enqueueSnackbar]);

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
        Lịch sử Biến động Nhân khẩu
      </Typography>

      <Paper sx={{ p: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Ngày biến động</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Họ tên</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Loại biến động</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Ghi chú</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Người ghi nhận</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {lichSuList.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>{new Date(item.ngayBienDong).toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell>{item.hoTenNhanKhau}</TableCell>
                    <TableCell>
                      <Chip label={item.loaiBienDong} size="small" />
                    </TableCell>
                    <TableCell>{item.ghiChu || '-'}</TableCell>
                    <TableCell>{item.nguoiGhiNhan || '-'}</TableCell>
                  </TableRow>
                ))}
                {lichSuList.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                      <Typography>Chưa có lịch sử biến động nào.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
}
