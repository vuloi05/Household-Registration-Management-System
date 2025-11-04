// src/pages/LichSuBienDongPage.tsx

import { useState, useEffect, useMemo } from 'react';
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
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TableSortLabel,
} from '@mui/material';
import { useSnackbar } from 'notistack';

import { getAllBienDong } from '../api/bienDongApi';
import type { BienDongNhanKhauDTO } from '../types/bienDong';

type Order = 'asc' | 'desc';

const getChipColor = (loaiBienDong: string) => {
  switch (loaiBienDong) {
    case 'CHUYEN_DI':
      return 'primary';
    case 'QUA_DOI':
      return 'secondary';
    case 'TAM_VANG':
      return 'warning';
    default:
      return 'default';
  }
};

export default function LichSuBienDongPage() {
  const { enqueueSnackbar } = useSnackbar();

  const [lichSuList, setLichSuList] = useState<BienDongNhanKhauDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [loaiBienDongFilter, setLoaiBienDongFilter] = useState('ALL');
  const [sortConfig, setSortConfig] = useState<{ key: keyof BienDongNhanKhauDTO; direction: Order }>(
    {
      key: 'ngayBienDong',
      direction: 'desc',
    }
  );

  useEffect(() => {
    setLoading(true);
    getAllBienDong()
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
  }, [enqueueSnackbar]);

  const sortedAndFilteredList = useMemo(() => {
    let filtered = lichSuList.filter(item =>
      (item.hoTenNhanKhau || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loaiBienDongFilter !== 'ALL') {
      filtered = filtered.filter(item => item.loaiBienDong === loaiBienDongFilter);
    }

    const sorted = [...filtered].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue == null) return 1;
      if (bValue == null) return -1;

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return sorted;
  }, [lichSuList, searchTerm, loaiBienDongFilter, sortConfig]);

  const handleSortRequest = (key: keyof BienDongNhanKhauDTO) => {
    const isAsc = sortConfig.key === key && sortConfig.direction === 'asc';
    setSortConfig({ key, direction: isAsc ? 'desc' : 'asc' });
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
        Lịch sử Biến động Nhân khẩu
      </Typography>

      <Paper sx={{ p: 2 }}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={8}>
            <TextField
              fullWidth
              variant="outlined"
              label="Tìm kiếm theo họ tên"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Loại biến động</InputLabel>
              <Select
                value={loaiBienDongFilter}
                label="Loại biến động"
                onChange={(e) => setLoaiBienDongFilter(e.target.value)}
              >
                <MenuItem value="ALL">Tất cả</MenuItem>
                <MenuItem value="CHUYEN_DI">Chuyển đi</MenuItem>
                <MenuItem value="QUA_DOI">Qua đời</MenuItem>
                <MenuItem value="TAM_VANG">Tạm vắng</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sortDirection={sortConfig.key === 'ngayBienDong' ? sortConfig.direction : false}>
                    <TableSortLabel
                      active={sortConfig.key === 'ngayBienDong'}
                      direction={sortConfig.key === 'ngayBienDong' ? sortConfig.direction : 'asc'}
                      onClick={() => handleSortRequest('ngayBienDong')}
                    >
                      Ngày biến động
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sortDirection={sortConfig.key === 'hoTenNhanKhau' ? sortConfig.direction : false}>
                    <TableSortLabel
                      active={sortConfig.key === 'hoTenNhanKhau'}
                      direction={sortConfig.key === 'hoTenNhanKhau' ? sortConfig.direction : 'asc'}
                      onClick={() => handleSortRequest('hoTenNhanKhau')}
                    >
                      Họ tên
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Căn cước</TableCell>
                  <TableCell>Loại biến động</TableCell>
                  <TableCell>Ghi chú</TableCell>
                  <TableCell>Người ghi nhận</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedAndFilteredList.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>{new Date(item.ngayBienDong).toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell>{item.hoTenNhanKhau}</TableCell>
                    <TableCell>{item.cmndCccd || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={item.loaiBienDong.replace('_', ' ')}
                        size="small"
                        color={getChipColor(item.loaiBienDong)}
                      />
                    </TableCell>
                    <TableCell>{item.ghiChu || '-'}</TableCell>
                    <TableCell>{item.nguoiGhiNhan || '-'}</TableCell>
                  </TableRow>
                ))}
                {sortedAndFilteredList.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                      <Typography>
                        {lichSuList.length > 0 ? 'Không tìm thấy kết quả phù hợp.' : 'Chưa có lịch sử biến động nào.'}
                      </Typography>
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
