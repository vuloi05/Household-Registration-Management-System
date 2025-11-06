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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TableSortLabel,
  InputAdornment,
  IconButton,
  Stack,
  Button,
  TablePagination,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
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

const getLoaiBienDongLabel = (loaiBienDong: string) => {
  switch (loaiBienDong) {
    case 'CHUYEN_DI':
      return 'Chuyển đi';
    case 'QUA_DOI':
      return 'Qua đời';
    case 'TAM_VANG':
      return 'Tạm vắng';
    default:
      return loaiBienDong.replace('_', ' ');
  }
};

export default function LichSuBienDongPage() {
  const { enqueueSnackbar } = useSnackbar();

  const [lichSuList, setLichSuList] = useState<BienDongNhanKhauDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [loaiBienDongFilter, setLoaiBienDongFilter] = useState('ALL');
  const [showFilters, setShowFilters] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: keyof BienDongNhanKhauDTO; direction: Order }>(
    {
      key: 'ngayBienDong',
      direction: 'desc',
    }
  );
  
  // Phân trang
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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
      (item.hoTenNhanKhau || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.cmndCccd || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.maHoKhau || '').toLowerCase().includes(searchTerm.toLowerCase())
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

  // Phân trang cho danh sách đã lọc
  const paginatedList = useMemo(() => {
    return sortedAndFilteredList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [sortedAndFilteredList, page, rowsPerPage]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setLoaiBienDongFilter('ALL');
    setPage(0);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(0);
  };

  const handleFilterChange = (value: string) => {
    setLoaiBienDongFilter(value);
    setPage(0);
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, width: '100%' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Lịch sử Biến động Nhân khẩu
        </Typography>
      </Box>

      {/* Thanh tìm kiếm */}
      <Box sx={{ mb: 3, width: '100%' }}>
        <TextField
          fullWidth
          placeholder="Tìm kiếm theo họ tên, CCCD, mã hộ khẩu..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                {searchTerm && (
                  <IconButton size="small" onClick={() => handleSearchChange('')}>
                    <ClearIcon />
                  </IconButton>
                )}
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            }
          }}
        />
      </Box>

      {/* Nút hiển thị/ẩn bộ lọc */}
      <Box sx={{ mb: 2 }}>
        <Button
          startIcon={<FilterListIcon />}
          onClick={() => setShowFilters(!showFilters)}
          variant="outlined"
          size="small"
        >
          {showFilters ? 'Ẩn bộ lọc' : 'Hiển thị bộ lọc'}
        </Button>
      </Box>

      {/* Bộ lọc */}
      {showFilters && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'background.default' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Loại biến động</InputLabel>
              <Select
                value={loaiBienDongFilter}
                label="Loại biến động"
                onChange={(e) => handleFilterChange(e.target.value)}
              >
                <MenuItem value="ALL">Tất cả</MenuItem>
                <MenuItem value="CHUYEN_DI">Chuyển đi</MenuItem>
                <MenuItem value="QUA_DOI">Qua đời</MenuItem>
                <MenuItem value="TAM_VANG">Tạm vắng</MenuItem>
              </Select>
            </FormControl>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={handleClearFilters}
              sx={{ minWidth: { sm: '150px' } }}
            >
              Xóa bộ lọc
            </Button>
          </Stack>
        </Paper>
      )}

      {/* Kết quả tìm kiếm */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Tìm thấy <strong>{sortedAndFilteredList.length}</strong> biến động
        </Typography>
      </Box>

      {/* Bảng dữ liệu */}
      <Paper sx={{ borderRadius: 2, p: 2, width: '100%' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer sx={{ width: '100%' }}>
            <Table sx={{ width: '100%', tableLayout: 'fixed' }} size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', width: '12%' }}>
                    <TableSortLabel
                      active={sortConfig.key === 'ngayBienDong'}
                      direction={sortConfig.key === 'ngayBienDong' ? sortConfig.direction : 'asc'}
                      onClick={() => handleSortRequest('ngayBienDong')}
                    >
                      Ngày biến động
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '18%' }}>
                    <TableSortLabel
                      active={sortConfig.key === 'hoTenNhanKhau'}
                      direction={sortConfig.key === 'hoTenNhanKhau' ? sortConfig.direction : 'asc'}
                      onClick={() => handleSortRequest('hoTenNhanKhau')}
                    >
                      Họ tên
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '12%' }}>CCCD</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '12%' }}>Mã Hộ khẩu</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '14%' }}>Loại biến động</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '20%' }}>Ghi chú</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '12%' }}>Người ghi nhận</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedList.map((item, index) => (
                  <TableRow key={item.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell sx={{ fontSize: '0.85rem' }}>
                      {new Date(item.ngayBienDong).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {item.hoTenNhanKhau}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.85rem' }}>{item.cmndCccd || '-'}</TableCell>
                    <TableCell sx={{ fontSize: '0.85rem' }}>{item.maHoKhau || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={getLoaiBienDongLabel(item.loaiBienDong)}
                        size="small"
                        color={getChipColor(item.loaiBienDong)}
                        sx={{ fontSize: '0.75rem', height: 24 }}
                      />
                    </TableCell>
                    <TableCell
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontSize: '0.85rem'
                      }}
                    >
                      {item.ghiChu || '-'}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.85rem' }}>{item.nguoiGhiNhan || '-'}</TableCell>
                  </TableRow>
                ))}
                {paginatedList.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                      <Typography variant="body2" color="text.secondary">
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

      {/* Phân trang */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={sortedAndFilteredList.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Số hàng mỗi trang:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} của ${count}`
        }
      />
    </Box>
  );
}
