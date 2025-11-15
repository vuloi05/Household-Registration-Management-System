// src/pages/NhanKhauPage.tsx
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
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
  Autocomplete,
  Menu,
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
  QrCodeScanner as QrCodeScannerIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import NhanKhauForm from '../components/forms/NhanKhauForm';
import NhanKhauDetailModal from '../components/details/NhanKhauDetailModal';
import ConfirmationDialog from '../components/shared/ConfirmationDialog';
import QRPollingModal from '../components/shared/QRPollingModal';
import BienDongNhanKhauForm from '../components/forms/BienDongNhanKhauForm';
import type { NhanKhauFormValues } from '../types/nhanKhau';
import type { BienDongNhanKhauFormValues } from '../types/bienDong';
import { exportToExcel, exportToPDF } from '../utils/exportUtils';
import {
  getAllNhanKhau,
  createNhanKhauManagement,
  updateNhanKhauManagement,
  deleteNhanKhauManagement,
  type NhanKhau,
} from '../api/nhanKhauApi';
import { ghiNhanBienDong } from '../api/bienDongApi';
import { useLocation, useNavigate } from 'react-router-dom';

export default function NhanKhauPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  // State mở/tắt modal chờ AppSheet
  const [qrPollingModalOpen, setQrPollingModalOpen] = useState(false);

  // State cho dữ liệu nhân khẩu
  const [nhanKhauList, setNhanKhauList] = useState<NhanKhau[]>([]);
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
  const [pendingAgentSearch, setPendingAgentSearch] = useState<{ query: string; triggeredAt: number; statusId?: string } | null>(null);
  const [pendingAgentDetailId, setPendingAgentDetailId] = useState<string | null>(null);
  const [lastDataLoadedAt, setLastDataLoadedAt] = useState(0);
  const searchQueryRef = useRef('');
  const [isAgentTypingSearch, setIsAgentTypingSearch] = useState(false);
  const agentTypingTimeoutRef = useRef<number | null>(null);

  // State for menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

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
      setLastDataLoadedAt(Date.now());
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

  useEffect(() => {
    searchQueryRef.current = searchQuery;
  }, [searchQuery]);

  useEffect(() => {
    return () => {
      if (agentTypingTimeoutRef.current) {
        window.clearTimeout(agentTypingTimeoutRef.current);
      }
    };
  }, []);

  const updateSearchValue = (
    value: string,
    options: { commit?: boolean; resetPage?: boolean } = {}
  ) => {
    const { commit = true, resetPage = true } = options;
    setSearchInputValue(value);
    if (commit) {
      setSearchQuery(value);
      if (resetPage) setPage(0);
    }
  };

  const simulateSearchTyping = (text: string, statusId?: string) => {
    if (!text) return;
    if (agentTypingTimeoutRef.current) {
      window.clearTimeout(agentTypingTimeoutRef.current);
    }
    setIsAgentTypingSearch(true);
    updateSearchValue('', { commit: false, resetPage: false });
    let index = 0;
    const typeNext = () => {
      const partial = text.slice(0, index + 1);
      updateSearchValue(partial, { commit: false, resetPage: false });
      index++;
      if (index < text.length) {
        agentTypingTimeoutRef.current = window.setTimeout(typeNext, 65);
      } else {
        setIsAgentTypingSearch(false);
        updateSearchValue(text, { commit: true, resetPage: true });
        setPendingAgentSearch({ query: text, triggeredAt: Date.now(), statusId });
      }
    };
    typeNext();
  };

  // Nhận QR từ AppSheet -> chỉ lấy số CCCD (trường đầu tiên trước ký tự '|') để tìm kiếm
  const handleReceiveQRCode = (qr: string) => {
    const parts = (qr || '').split('|').map(p => p.trim());
    const cccd = parts[0] || qr;
    updateSearchValue(cccd);
    enqueueSnackbar('Đã điền CCCD từ QR vào ô tìm kiếm', { variant: 'success' });
  };

  // Lắng nghe agent action sau khi điều hướng
  useEffect(() => {
    const s = location.state as any;
    if (!s || !s.agentAction) return;
    const act = s.agentAction;
    if (act.type === 'search' && act.target === 'person_list' && act.params?.q) {
      const query = String(act.params.q).trim();
      if (query) {
        let finalQuery = query;
        const currentQuery = searchQueryRef.current.trim();
        const addressKeywords = ['biệt thự', 'biet thu', 'thự', 'phố', 'đường', 'duong', 'xã', 'phường', 'quận', 'huyện', 'tỉnh', 'thành phố', 'the vesta', 'ấp', 'thôn', 'ngõ', 'ngõ', 'ngách'];
        const isAddress = addressKeywords.some(kw => query.toLowerCase().includes(kw));
        if (isAddress && currentQuery && !query.toLowerCase().includes(currentQuery.toLowerCase())) {
          finalQuery = `${currentQuery} ${query}`.trim();
        }
        setPendingAgentSearch(null);
        enqueueSnackbar('Agent: Đang tìm kiếm nhân khẩu: ' + finalQuery, { variant: 'info' });
        simulateSearchTyping(finalQuery, act.statusId);
        setPendingAgentDetailId(null);
      }
    }
    if (act.type === 'search' && act.target === 'person_list' && !act.params?.q) {
      setPendingAgentSearch(null);
    }
    if (act.type === 'navigate' && act.target === 'person_detail' && act.params?.personId) {
      setPendingAgentDetailId(String(act.params.personId));
    }
    navigate(location.pathname, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  useEffect(() => {
    if (!pendingAgentSearch) return;
    if (loading) return;
    if (lastDataLoadedAt < pendingAgentSearch.triggeredAt) return;
    const { query, statusId } = pendingAgentSearch;

    const notifySearchStatus = (text?: string) => {
      if (!statusId) return;
      window.dispatchEvent(
        new CustomEvent('agent-action-status', {
          detail: {
            statusId,
            text: text || `🔎 Đã tìm kiếm nhân khẩu: ${query}`,
            status: 'success',
          },
        })
      );
    };

    if (nhanKhauList.length === 0) {
      notifySearchStatus();
      window.dispatchEvent(new CustomEvent('agent-bot-message', {
        detail: `Không tìm thấy nhân khẩu phù hợp với từ khóa "${query}". Vui lòng cung cấp CCCD, mã hộ khẩu hoặc địa chỉ cụ thể hơn.`,
      }));
      setPendingAgentSearch(null);
      return;
    }
    if (nhanKhauList.length === 1) {
      notifySearchStatus();
      const only = nhanKhauList[0];
      handleViewDetail(only);
      window.dispatchEvent(new CustomEvent('agent-bot-message', {
        detail: `Hiện tại đang có 1 người tên là ${query}. Đang mở chi tiết hồ sơ cho bạn.`,
      }));
      setPendingAgentSearch(null);
      setPendingAgentDetailId(null);
      return;
    }
    const normalized = query.toLowerCase();
    const sameNameCount = nhanKhauList.filter(nk => (nk.hoTen || '').toLowerCase() === normalized).length;
    const totalDisplay = sameNameCount > 0 ? sameNameCount : nhanKhauList.length;
    const detailMessage = totalDisplay >= 2
      ? `Hiện tại đang có ${totalDisplay} người tên là ${query}. Bạn muốn tìm người nào? Vui lòng cung cấp thêm CCCD, mã hộ khẩu hoặc địa chỉ.`
      : `Hiện tại đang có ${totalDisplay} người tên là ${query}.`;
    notifySearchStatus();
    window.dispatchEvent(new CustomEvent('agent-bot-message', { detail: detailMessage }));
    setPendingAgentSearch(null);
  }, [pendingAgentSearch, loading, nhanKhauList, handleViewDetail, lastDataLoadedAt]);

  useEffect(() => {
    if (!pendingAgentDetailId || loading) return;
    const nk = nhanKhauList.find(
      item =>
        item.cmndCccd === pendingAgentDetailId ||
        String(item.id) === pendingAgentDetailId
    );
    if (nk) {
      setSelectedNhanKhau(nk);
      setDetailOpen(true);
      enqueueSnackbar('Agent: Đang mở chi tiết nhân khẩu: ' + nk.hoTen, { variant: 'info' });
      setPendingAgentDetailId(null);
    } else if (!loading) {
      enqueueSnackbar('Agent: Không tìm thấy nhân khẩu trong danh sách hiện tại', { variant: 'warning' });
      setPendingAgentDetailId(null);
    }
  }, [pendingAgentDetailId, nhanKhauList, loading, enqueueSnackbar]);

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

  // Không cần lấy locations từ data nữa vì đã có danh sách đầy đủ các tỉnh thành

  // Danh sách đầy đủ các tỉnh thành Việt Nam
  const vietnamProvinces = [
    'Hà Nội',
    'TP. Hồ Chí Minh',
    'Đà Nẵng',
    'Hải Phòng',
    'Cần Thơ',
    'An Giang',
    'Bà Rịa - Vũng Tàu',
    'Bắc Giang',
    'Bắc Kạn',
    'Bạc Liêu',
    'Bắc Ninh',
    'Bến Tre',
    'Bình Định',
    'Bình Dương',
    'Bình Phước',
    'Bình Thuận',
    'Cà Mau',
    'Cao Bằng',
    'Đắk Lắk',
    'Đắk Nông',
    'Điện Biên',
    'Đồng Nai',
    'Đồng Tháp',
    'Gia Lai',
    'Hà Giang',
    'Hà Nam',
    'Hà Tĩnh',
    'Hải Dương',
    'Hậu Giang',
    'Hòa Bình',
    'Hưng Yên',
    'Khánh Hòa',
    'Kiên Giang',
    'Kon Tum',
    'Lai Châu',
    'Lâm Đồng',
    'Lạng Sơn',
    'Lào Cai',
    'Long An',
    'Nam Định',
    'Nghệ An',
    'Ninh Bình',
    'Ninh Thuận',
    'Phú Thọ',
    'Phú Yên',
    'Quảng Bình',
    'Quảng Nam',
    'Quảng Ngãi',
    'Quảng Ninh',
    'Quảng Trị',
    'Sóc Trăng',
    'Sơn La',
    'Tây Ninh',
    'Thái Bình',
    'Thái Nguyên',
    'Thanh Hóa',
    'Thừa Thiên Huế',
    'Tiền Giang',
    'Trà Vinh',
    'Tuyên Quang',
    'Vĩnh Long',
    'Vĩnh Phúc',
    'Yên Bái',
    'Hà Tây',
  ];

  // Xử lý thêm nhân khẩu
  const handleAddNhanKhau = async (data: NhanKhauFormValues) => {
    try {
      await createNhanKhauManagement(data);
      enqueueSnackbar('Thêm nhân khẩu thành công', { variant: 'success' });
      setFormOpen(false);
      loadNhanKhauData(); // Reload data
    } catch (error: unknown) {
      console.error('Error creating nhan khau:', error);
      
      // Xử lý lỗi từ backend
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { error?: string } } };
        if (axiosError.response?.data?.error) {
          enqueueSnackbar(axiosError.response.data.error, { variant: 'error' });
        } else {
          enqueueSnackbar('Không thể thêm nhân khẩu', { variant: 'error' });
        }
      } else {
        enqueueSnackbar('Không thể thêm nhân khẩu', { variant: 'error' });
      }
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

  const handleBienDongSubmit = async (data: BienDongNhanKhauFormValues) => {
    try {
      await ghiNhanBienDong(data);
      enqueueSnackbar('Ghi nhận biến động thành công', { variant: 'success' });
      setBienDongFormOpen(false);
      loadNhanKhauData();
    } catch (error: any) {
      console.error('Error recording bien dong:', error);
      if (error.response?.data?.error) {
        enqueueSnackbar(error.response.data.error, { variant: 'error' });
      } else {
        enqueueSnackbar('Không thể ghi nhận biến động', { variant: 'error' });
      }
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
    handleMenuClose();
    setSelectedNhanKhau(nhanKhau);
    // Đảm bảo maHoKhau được map đúng từ dữ liệu nhân khẩu
    const formData: NhanKhauFormValues = {
      ...nhanKhau,
      ngayCap: nhanKhau.ngayCap || '',
      noiCap: nhanKhau.noiCap || '',
      maHoKhau: nhanKhau.maHoKhau || '',
    };
    setEditingNhanKhau(formData);
    setFormOpen(true);
  };

  // Xử lý mở dialog xóa
  const handleOpenDeleteDialog = (nhanKhau: NhanKhau) => {
    handleMenuClose();
    setSelectedNhanKhau(nhanKhau);
    setDeleteDialogOpen(true);
  };

  const handleOpenBienDongForm = (nhanKhau: NhanKhau) => {
    handleMenuClose();
    setSelectedNhanKhau(nhanKhau);
    setBienDongFormOpen(true);
  };

  // Xử lý xóa bộ lọc
  const handleClearFilters = () => {
    updateSearchValue('');
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
    updateSearchValue(value);
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
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, width: '100%' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
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
      <Box sx={{ mb: 3, width: '100%' }}>
        <TextField
          fullWidth
          placeholder="Tìm kiếm theo họ tên, CCCD, địa chỉ hộ khẩu, nghề nghiệp, mã hộ khẩu, ngày sinh..."
          value={searchInputValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <Stack direction="row" spacing={0.5}>
                  {searchInputValue && (
                    <IconButton size="small" onClick={() => handleSearchChange('')}>
                      <ClearIcon />
                    </IconButton>
                  )}
                  <Tooltip title="Quét từ AppSheet">
                    <IconButton
                      size="small"
                      onClick={() => setQrPollingModalOpen(true)}
                    >
                      <QrCodeScannerIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </InputAdornment>
            ),
          }}
          inputProps={{ readOnly: isAgentTypingSearch }}
          helperText={
            isAgentTypingSearch
              ? 'Trợ lý ảo đang nhập từ khóa giúp bạn...'
              : 'Bạn có thể nhập Họ tên, CCCD, hoặc địa chỉ hộ khẩu để tìm kiếm. Ví dụ: Nguyễn Mạnh Tí 023456789 hoặc Trần Thị Thảo Biệt thự The Vesta'
          }
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
              <Autocomplete
                fullWidth
                size="small"
                options={['all', ...vietnamProvinces]}
                value={locationFilter}
                onChange={(_event, newValue) => {
                  handleLocationFilterChange(newValue || 'all');
                }}
                getOptionLabel={(option) => option === 'all' ? 'Tất cả' : option}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Quê quán"
                    placeholder="Chọn hoặc nhập tỉnh/thành phố"
                  />
                )}
                isOptionEqualToValue={(option, value) => option === value}
                autoHighlight
                ListboxProps={{
                  style: {
                    maxHeight: 300,
                  },
                }}
              />
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
                  <TableCell sx={{ fontWeight: 'bold', width: '5%' }}>STT</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '18%' }}>Họ và Tên</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '11%' }}>Ngày sinh</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '6%' }}>Tuổi</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '9%' }}>Giới tính</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '12%' }}>CCCD</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '14%' }}>Nghề nghiệp</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '11%' }}>Quan hệ</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '10%' }}>Mã HK</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', width: '14%' }}>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {nhanKhauList.map((nhanKhau, index) => (
                  <TableRow key={nhanKhau.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      <Tooltip title={nhanKhau.hoTen}>
                        <Typography variant="body2" fontWeight={600} noWrap>
                          {nhanKhau.hoTen}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.85rem' }}>
                      {new Date(nhanKhau.ngaySinh).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell>{calculateAge(nhanKhau.ngaySinh)}</TableCell>
                    <TableCell>
                      <Chip
                        label={nhanKhau.gioiTinh || 'N/A'}
                        size="small"
                        color={nhanKhau.gioiTinh === 'Nam' ? 'primary' : 'secondary'}
                        sx={{ fontSize: '0.75rem', height: 24 }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.85rem' }}>{nhanKhau.cmndCccd || 'N/A'}</TableCell>
                    <TableCell sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      <Tooltip title={nhanKhau.ngheNghiep || 'N/A'}>
                        <span>{nhanKhau.ngheNghiep || 'N/A'}</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={nhanKhau.quanHeVoiChuHo}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: 24 }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.85rem' }}>{nhanKhau.maHoKhau || 'N/A'}</TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={0.5} justifyContent="center">
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
                        <Tooltip title="Thao tác khác">
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuClick(e, nhanKhau)}
                          >
                            <MoreVertIcon fontSize="small" />
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
      </Paper>

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