// src/pages/NhanKhauPage.tsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  TablePagination,
  MenuItem,
  Stack,
  Menu,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  FileDownload as FileDownloadIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import NhanKhauForm from '../components/forms/NhanKhauForm';
import NhanKhauDetailModal from '../components/details/NhanKhauDetailModal';
import ConfirmationDialog from '../components/shared/ConfirmationDialog';
import QRPollingModal from '../components/shared/QRPollingModal';
import BienDongNhanKhauForm from '../components/forms/BienDongNhanKhauForm';
import type { NhanKhauFormValues } from '../types/nhanKhau';
import NhanKhauExportDialog from '../components/nhanKhau/NhanKhauExportDialog';
import NhanKhauTable from '../components/nhanKhau/NhanKhauTable';
import {
  getAllNhanKhau,
  type NhanKhau,
} from '../api/nhanKhauApi';
import NhanKhauSearchAndFilter from '../components/nhanKhau/NhanKhauSearchAndFilter';
import { useNhanKhauAgent } from '../hooks/useNhanKhauAgent';
import { useNhanKhauHandlers } from '../hooks/useNhanKhauHandlers';

// Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => clearTimeout(handler);
  }, [value, delay]);
  
  return debouncedValue;
}

export default function NhanKhauPage() {
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // State mở/tắt modal chờ AppSheet
  const [qrPollingModalOpen, setQrPollingModalOpen] = useState(false);

  // State cho dữ liệu nhân khẩu
  const [nhanKhauList, setNhanKhauList] = useState<NhanKhau[]>([]); // Danh sách hiển thị (có lọc)
  const [allNhanKhau, setAllNhanKhau] = useState<NhanKhau[]>([]); // Toàn bộ danh sách (dùng cho xuất file)
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);

  // State cho tìm kiếm và lọc
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInputValue, setSearchInputValue] = useState('');
  const [ageFilter, setAgeFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // State cho phân trang
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // State cho form và modal
  const [formOpen, setFormOpen] = useState(false);
  const [bienDongFormOpen, setBienDongFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedNhanKhau, setSelectedNhanKhau] = useState<NhanKhau | null>(null);
  const [editingNhanKhau, setEditingNhanKhau] = useState<NhanKhauFormValues | null>(null);
  const [lastDataLoadedAt, setLastDataLoadedAt] = useState(0);

  // State for menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // State for export dialog
  const [exportOpen, setExportOpen] = useState(false);
  const [exportType, setExportType] = useState<'excel' | 'pdf'>('excel');

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleViewDetail = useCallback((nhanKhau: NhanKhau) => {
    handleMenuClose();
    setSelectedNhanKhau(nhanKhau);
    setDetailOpen(true);
  }, [handleMenuClose]);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, nhanKhau: NhanKhau) => {
    setAnchorEl(event.currentTarget);
    setSelectedNhanKhau(nhanKhau);
  };

  // Load dữ liệu từ API
  const loadNhanKhauData = useCallback(async () => {
    setLoading(true);
    try {
      // Chỉ lấy dữ liệu cho trang hiện tại
      const response = await getAllNhanKhau({
        page: page,
        size: rowsPerPage,
        search: searchQuery || undefined,
        ageFilter: ageFilter !== 'all' ? ageFilter : undefined,
        genderFilter: genderFilter !== 'all' ? genderFilter : undefined,
        locationFilter: locationFilter !== 'all' ? locationFilter : undefined,
      });

      // Sắp xếp theo tên (A-Z)
      const sortedData = [...response.data].sort((a, b) => {
        const nameA = a.hoTen.toLowerCase();
        const nameB = b.hoTen.toLowerCase();
        return nameA.localeCompare(nameB, 'vi');
      });

      setNhanKhauList(sortedData);
      setTotalItems(response.totalItems);
      setLastDataLoadedAt(Date.now());
    } catch (error) {
      console.error('Error loading nhan khau:', error);
      enqueueSnackbar('Không thể tải dữ liệu nhân khẩu. Vui lòng kiểm tra backend có đang chạy không.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchQuery, ageFilter, genderFilter, locationFilter, enqueueSnackbar]);

  // Load toàn bộ dữ liệu khi xuất file
  const loadAllDataForExport = async () => {
    try {
      const allDataResponse = await getAllNhanKhau({
        page: 0,
        size: 10000,
        search: searchQuery || undefined,
        ageFilter: ageFilter !== 'all' ? ageFilter : undefined,
        genderFilter: genderFilter !== 'all' ? genderFilter : undefined,
        locationFilter: locationFilter !== 'all' ? locationFilter : undefined,
      });

      const sortedData = [...allDataResponse.data].sort((a, b) => {
        return a.hoTen.toLowerCase().localeCompare(b.hoTen.toLowerCase(), 'vi');
      });

      return sortedData;
    } catch (error) {
      console.error('Error loading all data:', error);
      throw error;
    }
  };

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    loadNhanKhauData();
  }, [debouncedSearchQuery, ageFilter, genderFilter, locationFilter, page, rowsPerPage, loadNhanKhauData]);

  const updateSearchValue = (value: string) => {
    setSearchInputValue(value);
    setSearchQuery(value);
    setPage(0);
  };

  // Use agent hook
  const { isAgentTypingSearch, handleReceiveQRCode } = useNhanKhauAgent({
    searchQuery,
    setSearchQuery,
    setSearchInputValue: (value: string) => {
      setSearchInputValue(value);
      return value;
    },
    setPage,
    nhanKhauList,
    loading,
    lastDataLoadedAt,
    setLastDataLoadedAt,
    handleViewDetail,
    setSelectedNhanKhau,
    setDetailOpen,
  });

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

  // Use handlers hook
  const {
    handleAddNhanKhau,
    handleUpdateNhanKhau,
    handleDeleteNhanKhau,
    handleBienDongSubmit,
    handleOpenAddForm,
    handleOpenEditForm,
    handleOpenDeleteDialog,
    handleOpenBienDongForm,
  } = useNhanKhauHandlers({
    loadNhanKhauData,
    setFormOpen,
    setBienDongFormOpen,
    setDeleteDialogOpen,
    setSelectedNhanKhau,
    setEditingNhanKhau,
    handleMenuClose,
    selectedNhanKhau,
  });

  // Xử lý xóa bộ lọc
  const handleClearFilters = () => {
    updateSearchValue('');
    setAgeFilter('all');
    setGenderFilter('all');
    setLocationFilter('all');
  };

  const handleSearchChange = (value: string) => {
    updateSearchValue(value);
  };

  // Xử lý xuất Excel
  const handleExportExcel = async () => {
    setExportType('excel');
    setExportOpen(true);
    // Load dữ liệu khi mở dialog
    if (allNhanKhau.length === 0) {
      const data = await loadAllDataForExport();
      setAllNhanKhau(data);
    }
  };

  // Xử lý xuất PDF
  const handleExportPDF = async () => {
    setExportType('pdf');
    setExportOpen(true);
    // Load dữ liệu khi mở dialog
    if (allNhanKhau.length === 0) {
      const data = await loadAllDataForExport();
      setAllNhanKhau(data);
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

  // Memoize displayed data
  const displayedNhanKhau = useMemo(() => {
    return nhanKhauList;
  }, [nhanKhauList]);

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'stretch', sm: 'center' },
        gap: 2,
        mb: 3, 
        width: '100%' 
      }}>
        <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ fontWeight: 'bold' }}>
          Quản lý Nhân khẩu
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ width: { xs: '100%', sm: 'auto' } }}>
          <Button
            variant="outlined"
            startIcon={!isMobile && <FileDownloadIcon />}
            onClick={handleExportExcel}
            disabled={totalItems === 0}
            fullWidth={isMobile}
            size={isMobile ? 'medium' : 'medium'}
          >
            Xuất Excel
          </Button>
          <Button
            variant="outlined"
            startIcon={!isMobile && <FileDownloadIcon />}
            onClick={handleExportPDF}
            disabled={totalItems === 0}
            fullWidth={isMobile}
            size={isMobile ? 'medium' : 'medium'}
          >
            Xuất PDF
          </Button>
          <Button
            variant="contained"
            startIcon={!isMobile && <AddIcon />}
            onClick={handleOpenAddForm}
            fullWidth={isMobile}
            size={isMobile ? 'medium' : 'medium'}
          >
            Thêm Nhân khẩu
          </Button>
        </Stack>
      </Box>

      {/* Search and Filter */}
      <NhanKhauSearchAndFilter
        searchInputValue={searchInputValue}
        onSearchChange={handleSearchChange}
        ageFilter={ageFilter}
        onAgeFilterChange={handleAgeFilterChange}
        genderFilter={genderFilter}
        onGenderFilterChange={handleGenderFilterChange}
        locationFilter={locationFilter}
        onLocationFilterChange={handleLocationFilterChange}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        onClearFilters={handleClearFilters}
        isAgentTypingSearch={isAgentTypingSearch}
        onOpenQrScanner={() => setQrPollingModalOpen(true)}
      />

      {/* Kết quả tìm kiếm */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Tìm thấy <strong>{totalItems}</strong> nhân khẩu
        </Typography>
      </Box>

      {/* Bảng dữ liệu - Responsive */}
      <NhanKhauTable
        nhanKhauList={nhanKhauList}
        displayedNhanKhau={displayedNhanKhau}
        loading={loading}
        isMobile={isMobile}
        page={page}
        rowsPerPage={rowsPerPage}
        calculateAge={calculateAge}
        handleViewDetail={handleViewDetail}
        handleOpenEditForm={handleOpenEditForm}
        handleOpenDeleteDialog={handleOpenDeleteDialog}
        handleMenuClick={handleMenuClick}
      />

      {/* Export Dialog */}
      <NhanKhauExportDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        exportType={exportType}
        allNhanKhau={allNhanKhau}
        loadAllDataForExport={loadAllDataForExport}
        setAllNhanKhau={setAllNhanKhau}
      />

      {/* Phân trang */}
      <TablePagination
        rowsPerPageOptions={isMobile ? [10, 25] : [5, 10, 25, 50]}
        component="div"
        count={totalItems}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage={isMobile ? 'Dòng:' : 'Số hàng mỗi trang:'}
        labelDisplayedRows={({ from, to, count }) =>
          isMobile ? `${from}-${to}/${count}` : `${from}-${to} của ${count}`
        }
        sx={{
          '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
            fontSize: isMobile ? '0.875rem' : '1rem',
          },
        }}
      />

      {/* Menu thao tác */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleOpenBienDongForm(selectedNhanKhau!)}>Ghi nhận biến động</MenuItem>
      </Menu>

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
        showMaHoKhauField={true} // Hiển thị ô nhập mã hộ khẩu cho trang quản lý nhân khẩu
      />

      {/* Form biến động nhân khẩu */}
      {selectedNhanKhau && (
        <BienDongNhanKhauForm
          open={bienDongFormOpen}
          onClose={() => setBienDongFormOpen(false)}
          onSubmit={handleBienDongSubmit}
          nhanKhauId={selectedNhanKhau.id}
        />
      )}

      {/* Modal chi tiết nhân khẩu */}
      <NhanKhauDetailModal
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setSelectedNhanKhau(null);
        }}
        nhanKhau={selectedNhanKhau}
        loading={loading}
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

      {/* QR Polling Modal (AppSheet + Google Sheets) */}
      <QRPollingModal
        open={qrPollingModalOpen}
        onClose={() => setQrPollingModalOpen(false)}
        onReceiveQRCode={handleReceiveQRCode}
      />

    </Box>
  );
}