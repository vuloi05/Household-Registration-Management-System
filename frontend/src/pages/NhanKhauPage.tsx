// src/pages/NhanKhauPage.tsx
import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Tooltip,
  Paper,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  FileDownload as FileDownloadIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import NhanKhauForm from '../components/forms/NhanKhauForm';
import NhanKhauDetailModal from '../components/details/NhanKhauDetailModal';
import ConfirmationDialog from '../components/shared/ConfirmationDialog';
import type { NhanKhauFormValues } from '../types/nhanKhau';
import { exportToExcel, exportToPDF } from '../utils/exportUtils';
import {
  getAllNhanKhau,
  createNhanKhauManagement,
  updateNhanKhauManagement,
  deleteNhanKhauManagement,
  type NhanKhau,
} from '../api/nhanKhauApi';

export default function NhanKhauPage() {
  const { enqueueSnackbar } = useSnackbar();
  
  // State cho dữ liệu nhân khẩu
  const [nhanKhauList, setNhanKhauList] = useState<NhanKhau[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  
  // State cho tìm kiếm và lọc
  const [searchQuery, setSearchQuery] = useState('');
  const [ageFilter, setAgeFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // State cho phân trang
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // State cho form và modal
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedNhanKhau, setSelectedNhanKhau] = useState<NhanKhau | null>(null);
  const [editingNhanKhau, setEditingNhanKhau] = useState<NhanKhauFormValues | null>(null);

  // Load dữ liệu từ API
  const loadNhanKhauData = async () => {
    setLoading(true);
    try {
      const response = await getAllNhanKhau({
        page: page,
        size: rowsPerPage,
        search: searchQuery || undefined,
        ageFilter: ageFilter !== 'all' ? ageFilter : undefined,
        genderFilter: genderFilter !== 'all' ? genderFilter : undefined,
        locationFilter: locationFilter !== 'all' ? locationFilter : undefined,
      });
      
      setNhanKhauList(response.data);
      setTotalItems(response.totalItems);
    } catch (error) {
      console.error('Error loading nhan khau:', error);
      enqueueSnackbar('Không thể tải dữ liệu nhân khẩu. Vui lòng kiểm tra backend có đang chạy không.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNhanKhauData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, searchQuery, ageFilter, genderFilter, locationFilter]);

  // Tính tuổi từ ngày sinh
  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Lọc và tìm kiếm dữ liệu (không cần nữa vì backend đã xử lý)
  // Nhưng vẫn giữ để lấy danh sách locations unique
  const locations = useMemo(() => {
    const uniqueLocations = [...new Set(nhanKhauList.map((nk) => nk.queQuan).filter(Boolean))];
    return uniqueLocations.sort();
  }, [nhanKhauList]);

  // Xử lý thêm nhân khẩu
  const handleAddNhanKhau = async (data: NhanKhauFormValues) => {
    try {
      await createNhanKhauManagement(data);
      enqueueSnackbar('Thêm nhân khẩu thành công', { variant: 'success' });
      setFormOpen(false);
      loadNhanKhauData(); // Reload data
    } catch (error) {
      console.error('Error creating nhan khau:', error);
      enqueueSnackbar('Không thể thêm nhân khẩu', { variant: 'error' });
    }
  };

  // Xử lý cập nhật nhân khẩu
  const handleUpdateNhanKhau = async (data: NhanKhauFormValues) => {
    if (!selectedNhanKhau) return;
    
    try {
      await updateNhanKhauManagement(selectedNhanKhau.id, data);
      enqueueSnackbar('Cập nhật nhân khẩu thành công', { variant: 'success' });
      setFormOpen(false);
      setSelectedNhanKhau(null);
      setEditingNhanKhau(null);
      loadNhanKhauData(); // Reload data
    } catch (error) {
      console.error('Error updating nhan khau:', error);
      enqueueSnackbar('Không thể cập nhật nhân khẩu', { variant: 'error' });
    }
  };

  // Xử lý xóa nhân khẩu
  const handleDeleteNhanKhau = async () => {
    if (!selectedNhanKhau) return;
    
    try {
      await deleteNhanKhauManagement(selectedNhanKhau.id);
      enqueueSnackbar('Xóa nhân khẩu thành công', { variant: 'success' });
      setDeleteDialogOpen(false);
      setSelectedNhanKhau(null);
      loadNhanKhauData(); // Reload data
    } catch (error) {
      console.error('Error deleting nhan khau:', error);
      enqueueSnackbar('Không thể xóa nhân khẩu', { variant: 'error' });
    }
  };

  // Xử lý mở form thêm mới
  const handleOpenAddForm = () => {
    setSelectedNhanKhau(null);
    setEditingNhanKhau(null);
    setFormOpen(true);
  };

  // Xử lý mở form chỉnh sửa
  const handleOpenEditForm = (nhanKhau: NhanKhau) => {
    setSelectedNhanKhau(nhanKhau);
    setEditingNhanKhau(nhanKhau as NhanKhauFormValues);
    setFormOpen(true);
  };

  // Xử lý xem chi tiết
  const handleViewDetail = (nhanKhau: NhanKhau) => {
    setSelectedNhanKhau(nhanKhau);
    setDetailOpen(true);
  };

  // Xử lý mở dialog xóa
  const handleOpenDeleteDialog = (nhanKhau: NhanKhau) => {
    setSelectedNhanKhau(nhanKhau);
    setDeleteDialogOpen(true);
  };

  // Xử lý xóa bộ lọc
  const handleClearFilters = () => {
    setSearchQuery('');
    setAgeFilter('all');
    setGenderFilter('all');
    setLocationFilter('all');
  };

  // Xử lý xuất Excel
  const handleExportExcel = () => {
    try {
      exportToExcel(nhanKhauList, 'Danh_sach_nhan_khau');
      enqueueSnackbar('Xuất Excel thành công', { variant: 'success' });
    } catch {
      enqueueSnackbar('Không thể xuất file Excel', { variant: 'error' });
    }
  };

  // Xử lý xuất PDF
  const handleExportPDF = () => {
    try {
      exportToPDF(nhanKhauList, 'Danh sach Nhan khau');
      enqueueSnackbar('Xuất PDF thành công', { variant: 'success' });
    } catch {
      enqueueSnackbar('Không thể xuất file PDF', { variant: 'error' });
    }
  };

  // Phân trang - reset về page 0 khi thay đổi filter
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Reset page khi filter thay đổi
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(0);
  };

  const handleAgeFilterChange = (value: string) => {
    setAgeFilter(value);
    setPage(0);
  };

  const handleGenderFilterChange = (value: string) => {
    setGenderFilter(value);
    setPage(0);
  };

  const handleLocationFilterChange = (value: string) => {
    setLocationFilter(value);
    setPage(0);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" component="h1">
              Quản lý Nhân khẩu
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<FileDownloadIcon />}
                onClick={handleExportExcel}
                disabled={totalItems === 0}
              >
                Xuất Excel
              </Button>
              <Button
                variant="outlined"
                startIcon={<FileDownloadIcon />}
                onClick={handleExportPDF}
                disabled={totalItems === 0}
              >
                Xuất PDF
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenAddForm}
              >
                Thêm Nhân khẩu
              </Button>
            </Stack>
          </Box>

          {/* Thanh tìm kiếm */}
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm theo họ tên hoặc số CCCD..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => handleSearchChange('')}>
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
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
              <Stack spacing={2}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Độ tuổi</InputLabel>
                    <Select
                      value={ageFilter}
                      label="Độ tuổi"
                      onChange={(e) => handleAgeFilterChange(e.target.value)}
                    >
                      <MenuItem value="all">Tất cả</MenuItem>
                      <MenuItem value="under18">Dưới 18 tuổi</MenuItem>
                      <MenuItem value="18-35">18-35 tuổi</MenuItem>
                      <MenuItem value="36-60">36-60 tuổi</MenuItem>
                      <MenuItem value="over60">Trên 60 tuổi</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl fullWidth size="small">
                    <InputLabel>Giới tính</InputLabel>
                    <Select
                      value={genderFilter}
                      label="Giới tính"
                      onChange={(e) => handleGenderFilterChange(e.target.value)}
                    >
                      <MenuItem value="all">Tất cả</MenuItem>
                      <MenuItem value="Nam">Nam</MenuItem>
                      <MenuItem value="Nữ">Nữ</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl fullWidth size="small">
                    <InputLabel>Quê quán</InputLabel>
                    <Select
                      value={locationFilter}
                      label="Quê quán"
                      onChange={(e) => handleLocationFilterChange(e.target.value)}
                    >
                      <MenuItem value="all">Tất cả</MenuItem>
                      {locations.map((location) => (
                        <MenuItem key={location} value={location}>
                          {location}
                        </MenuItem>
                      ))}
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
              </Stack>
            </Paper>
          )}

          {/* Kết quả tìm kiếm */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Tìm thấy <strong>{totalItems}</strong> nhân khẩu
            </Typography>
          </Box>

          {/* Bảng dữ liệu */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
            <Table sx={{ minWidth: 1200 }}>
              <TableHead>
                <TableRow>
                  <TableCell>STT</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap', minWidth: 160 }}>Họ và Tên</TableCell>
                  <TableCell>Ngày sinh</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap', minWidth: 80 }}>Tuổi</TableCell>
                  <TableCell>Giới tính</TableCell>
                  <TableCell>CCCD</TableCell>
                  <TableCell sx={{ maxWidth: 180 }}>Nghề nghiệp</TableCell>
                  <TableCell>Quan hệ</TableCell>
                  <TableCell>Mã hộ khẩu</TableCell>
                  <TableCell align="center">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {nhanKhauList.map((nhanKhau, index) => (
                  <TableRow key={nhanKhau.id} hover>
                      <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        <Typography variant="body2" fontWeight={600}>
                          {nhanKhau.hoTen}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {new Date(nhanKhau.ngaySinh).toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{calculateAge(nhanKhau.ngaySinh)} tuổi</TableCell>
                      <TableCell>
                        <Chip
                          label={nhanKhau.gioiTinh || 'N/A'}
                          size="small"
                          color={nhanKhau.gioiTinh === 'Nam' ? 'primary' : 'secondary'}
                        />
                      </TableCell>
                      <TableCell>{nhanKhau.cmndCccd || 'N/A'}</TableCell>
                      <TableCell sx={{ maxWidth: 180, wordWrap: 'break-word' }}>{nhanKhau.ngheNghiep || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip
                          label={nhanKhau.quanHeVoiChuHo}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{nhanKhau.maHoKhau || 'N/A'}</TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Tooltip title="Xem chi tiết">
                            <IconButton
                              size="small"
                              color="info"
                              onClick={() => handleViewDetail(nhanKhau)}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Chỉnh sửa">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleOpenEditForm(nhanKhau)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Xóa">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleOpenDeleteDialog(nhanKhau)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                {nhanKhauList.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        Không tìm thấy nhân khẩu nào
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          )}

          {/* Phân trang */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={totalItems}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Số hàng mỗi trang:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} của ${count}`
            }
          />
        </CardContent>
      </Card>

      {/* Form thêm/sửa nhân khẩu */}
      <NhanKhauForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelectedNhanKhau(null);
          setEditingNhanKhau(null);
        }}
        onSubmit={editingNhanKhau ? handleUpdateNhanKhau : handleAddNhanKhau}
        initialData={editingNhanKhau}
      />

      {/* Modal chi tiết nhân khẩu */}
      <NhanKhauDetailModal
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setSelectedNhanKhau(null);
        }}
        nhanKhau={selectedNhanKhau}
      />

      {/* Dialog xác nhận xóa */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa nhân khẩu "${selectedNhanKhau?.hoTen}" khỏi hệ thống?`}
        onConfirm={handleDeleteNhanKhau}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedNhanKhau(null);
        }}
      />
    </Box>
  );
}
