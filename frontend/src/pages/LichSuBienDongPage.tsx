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
  Button,
  Chip,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { getLichSuByHoKhauId } from '../api/bienDongApi';
import type { BienDongNhanKhauDTO } from '../types/bienDong';

export default function LichSuBienDongPage() {
  const { hoKhauId } = useParams<{ hoKhauId: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [lichSuList, setLichSuList] = useState<BienDongNhanKhauDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (hoKhauId) {
      setLoading(true);
      getLichSuByHoKhauId(parseInt(hoKhauId, 10))
        .then(response => {
          setLichSuList(response.data);
        })
        .catch(error => {
          console.error('Error fetching lich su bien dong:', error);
          enqueueSnackbar('Không thể tải lịch sử biến động.', { variant: 'error' });
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [hoKhauId, enqueueSnackbar]);

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(`/ho-khau/${lichSuList[0]?.maHoKhau || ''}`)}
        sx={{ mb: 2 }}
        variant="outlined"
      >
        Quay lại chi tiết hộ khẩu
      </Button>

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
                  <TableCell sx={{ fontWeight: 'bold' }}>Nơi chuyển đến</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Lý do</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Ghi chú</TableCell>
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
                    <TableCell>{item.noiChuyenDen || '-'}</TableCell>
                    <TableCell>{item.lyDo || '-'}</TableCell>
                    <TableCell>{item.ghiChu || '-'}</TableCell>
                  </TableRow>
                ))}
                {lichSuList.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
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
