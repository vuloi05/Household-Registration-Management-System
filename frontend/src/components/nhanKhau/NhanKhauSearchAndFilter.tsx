// src/components/nhanKhau/NhanKhauSearchAndFilter.tsx

import {
  Box,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Tooltip,
  Paper,
  Autocomplete,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  QrCodeScanner as QrCodeScannerIcon,
} from '@mui/icons-material';

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

interface NhanKhauSearchAndFilterProps {
  searchInputValue: string;
  onSearchChange: (value: string) => void;
  ageFilter: string;
  onAgeFilterChange: (value: string) => void;
  genderFilter: string;
  onGenderFilterChange: (value: string) => void;
  locationFilter: string;
  onLocationFilterChange: (value: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  onClearFilters: () => void;
  isAgentTypingSearch: boolean;
  onOpenQrScanner: () => void;
}

export default function NhanKhauSearchAndFilter({
  searchInputValue,
  onSearchChange,
  ageFilter,
  onAgeFilterChange,
  genderFilter,
  onGenderFilterChange,
  locationFilter,
  onLocationFilterChange,
  showFilters,
  onToggleFilters,
  onClearFilters,
  isAgentTypingSearch,
  onOpenQrScanner,
}: NhanKhauSearchAndFilterProps) {
  return (
    <>
      {/* Thanh tìm kiếm */}
      <Box sx={{ mb: 3, width: '100%' }}>
        <TextField
          fullWidth
          placeholder="Tìm kiếm theo họ tên, CCCD, quê quán, ngày sinh..."
          value={searchInputValue}
          onChange={(e) => onSearchChange(e.target.value)}
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
                    <IconButton size="small" onClick={() => onSearchChange('')}>
                      <ClearIcon />
                    </IconButton>
                  )}
                  <Tooltip title="Quét từ AppSheet">
                    <IconButton
                      size="small"
                      onClick={onOpenQrScanner}
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
              : 'Bạn có thể nhập Họ tên, CCCD, quê quán, hoặc ngày sinh để tìm kiếm. Ví dụ: Nguyễn Mạnh Tí 023456789 hoặc Hà Nội'
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
          onClick={onToggleFilters}
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
                  onChange={(e) => onAgeFilterChange(e.target.value)}
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
                  onChange={(e) => onGenderFilterChange(e.target.value)}
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
                  onLocationFilterChange(newValue || 'all');
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
                onClick={onClearFilters}
                sx={{ minWidth: { sm: '150px' } }}
              >
                Xóa bộ lọc
              </Button>
            </Stack>
          </Stack>
        </Paper>
      )}
    </>
  );
}

