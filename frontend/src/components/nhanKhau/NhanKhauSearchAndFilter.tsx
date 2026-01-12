// src/components/nhanKhau/NhanKhauSearchAndFilter.tsx
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('nhanKhau');

  return (
    <>
      {/* Thanh tìm kiếm */}
      <Box sx={{ mb: 3, width: '100%' }}>
        <TextField
          fullWidth
          placeholder={t('search_placeholder')}
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
                  <Tooltip title={t('scan_from_appsheet_tooltip')}>
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
              ? t('agent_typing_helper')
              : t('search_helper_text')
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
          {showFilters ? t('hide_filters') : t('show_filters')}
        </Button>
      </Box>

      {/* Bộ lọc */}
      {showFilters && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'background.default' }}>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl fullWidth size="small">
                <InputLabel>{t('age_filter_label')}</InputLabel>
                <Select
                  value={ageFilter}
                  label={t('age_filter_label')}
                  onChange={(e) => onAgeFilterChange(e.target.value)}
                >
                  <MenuItem value="all">{t('filter_all')}</MenuItem>
                  <MenuItem value="under18">{t('age_under_18')}</MenuItem>
                  <MenuItem value="18-35">{t('age_18_35')}</MenuItem>
                  <MenuItem value="36-60">{t('age_36_60')}</MenuItem>
                  <MenuItem value="over60">{t('age_over_60')}</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel>{t('gender_filter_label')}</InputLabel>
                <Select
                  value={genderFilter}
                  label={t('gender_filter_label')}
                  onChange={(e) => onGenderFilterChange(e.target.value)}
                >
                  <MenuItem value="all">{t('filter_all')}</MenuItem>
                  <MenuItem value="Nam">{t('gender_male')}</MenuItem>
                  <MenuItem value="Nữ">{t('gender_female')}</MenuItem>
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
                getOptionLabel={(option) => option === 'all' ? t('filter_all') : option}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t('location_filter_label')}
                    placeholder={t('location_placeholder')}
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
                {t('clear_filters')}
              </Button>
            </Stack>
          </Stack>
        </Paper>
      )}
    </>
  );
}

