// src/pages/TamVangTamTruPage.tsx

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tab,
  Tabs,
  Paper,
  Button,
  Table, TableHead, TableRow, TableCell, TableBody, TableContainer,
  TextField,
  InputAdornment,
  TablePagination,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import { useSnackbar } from 'notistack';

import { getAllTamVang, createTamVang } from '../api/tamVangApi';
import { getAllTamTru, createTamTru } from '../api/tamTruApi';
import type { TamVang, TamVangFormValues } from '../types/tamVang';
import type { TamTru, TamTruFormValues } from '../types/tamTru';
import TamVangForm from '../components/forms/TamVangForm';
import TamTruForm from '../components/forms/TamTruForm';

function TabPanel(props: {
  children?: React.ReactNode;
  index: number;
  value: number;
}) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function TamVangTamTruPage() {
  const { enqueueSnackbar } = useSnackbar();
  const [tabValue, setTabValue] = useState(0);

  const [tamVangList, setTamVangList] = useState<TamVang[]>([]);
  const [tamTruList, setTamTruList] = useState<TamTru[]>([]);

  // Loading states
  const [loadingTamVang, setLoadingTamVang] = useState<boolean>(false);
  const [loadingTamTru, setLoadingTamTru] = useState<boolean>(false);

  const [tamVangFormOpen, setTamVangFormOpen] = useState(false);
  const [tamTruFormOpen, setTamTruFormOpen] = useState(false);

  // Search states
  const [searchTamVang, setSearchTamVang] = useState('');
  const [searchTamTru, setSearchTamTru] = useState('');

  // Client-side pagination states (to align with HoKhau/NhanKhau pages)
  const [pageTamVang, setPageTamVang] = useState(0);
  const [rowsPerPageTamVang, setRowsPerPageTamVang] = useState(10);
  const [pageTamTru, setPageTamTru] = useState(0);
  const [rowsPerPageTamTru, setRowsPerPageTamTru] = useState(10);

  const fetchTamVang = async () => {
    try {
      setLoadingTamVang(true);
      const response = await getAllTamVang();
      setTamVangList(response.data);
      setPageTamVang(0);
    } catch (error) {
      enqueueSnackbar('Không thể tải danh sách tạm vắng', { variant: 'error' });
    } finally {
      setLoadingTamVang(false);
    }
  };

  const fetchTamTru = async () => {
    try {
      setLoadingTamTru(true);
      const response = await getAllTamTru();
      setTamTruList(response.data);
      setPageTamTru(0);
    } catch (error) {
      enqueueSnackbar('Không thể tải danh sách tạm trú', { variant: 'error' });
    } finally {
      setLoadingTamTru(false);
    }
  };

  useEffect(() => {
    fetchTamVang();
    fetchTamTru();
  }, []);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCreateTamVang = async (data: TamVangFormValues) => {
    try {
      await createTamVang(data);
      enqueueSnackbar('Thêm tạm vắng thành công', { variant: 'success' });
      setTamVangFormOpen(false);
      fetchTamVang();
    } catch (error) {
      enqueueSnackbar('Không thể thêm tạm vắng', { variant: 'error' });
    }
  };

  const handleCreateTamTru = async (data: TamTruFormValues) => {
    try {
      await createTamTru(data);
      enqueueSnackbar('Thêm tạm trú thành công', { variant: 'success' });
      setTamTruFormOpen(false);
      fetchTamTru();
    } catch (error) {
      enqueueSnackbar('Không thể thêm tạm trú', { variant: 'error' });
    }
  };

  // Filtered lists for search
  const filteredTamVang = tamVangList.filter(item => {
    if (!searchTamVang.trim()) return true;
    const q = searchTamVang.toLowerCase();
    return (
      (item.nhanKhauHoTen ?? '').toLowerCase().includes(q) ||
      String(item.nhanKhauId ?? '').toLowerCase().includes(q) ||
      (item.noiDen ?? '').toLowerCase().includes(q) ||
      (item.lyDo ?? '').toLowerCase().includes(q)
    );
  });

  const filteredTamTru = tamTruList.filter(item => {
    if (!searchTamTru.trim()) return true;
    const q = searchTamTru.toLowerCase();
    return (
      (item.hoTen ?? '').toLowerCase().includes(q) ||
      String(item.hoKhauTiepNhanId ?? '').toLowerCase().includes(q) ||
      (item.lyDo ?? '').toLowerCase().includes(q)
    );
  });

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      {/* Header with action button aligned to reference pages */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, width: '100%' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Quản lý Tạm vắng / Tạm trú
        </Typography>
        {tabValue === 0 ? (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setTamVangFormOpen(true)}>
            Thêm Tạm vắng
          </Button>
        ) : (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setTamTruFormOpen(true)}>
            Thêm Tạm trú
          </Button>
        )}
      </Box>

      <Paper sx={{ borderRadius: 2, p: 2, width: '100%' }}>
        <Box sx={{ mb: 2 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="tạm vắng tạm trú tabs"
            TabIndicatorProps={{ style: { display: 'none' } }}
            sx={{
              bgcolor: 'background.default',
              p: 0.5,
              borderRadius: 999,
              width: 'fit-content'
            }}
          >
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FlightTakeoffIcon fontSize="small" />
                  <span>Tạm vắng</span>
                </Box>
              }
              disableRipple
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: 999,
                minHeight: 40,
                px: 2.5,
                color: 'text.secondary',
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                }
              }}
            />
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HomeWorkIcon fontSize="small" />
                  <span>Tạm trú</span>
                </Box>
              }
              disableRipple
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: 999,
                minHeight: 40,
                px: 2.5,
                color: 'text.secondary',
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                }
              }}
            />
          </Tabs>
        </Box>

        {/* Search bar per tab */}
        {tabValue === 0 ? (
          <Box sx={{ mb: 2, width: '100%' }}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm theo Họ tên, Nhân khẩu ID, nơi đến, lý do..."
              value={searchTamVang}
              onChange={(e) => { setSearchTamVang(e.target.value); setPageTamVang(0); }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Box>
        ) : (
          <Box sx={{ mb: 2, width: '100%' }}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm theo Họ tên, mã hộ khẩu tiếp nhận, lý do..."
              value={searchTamTru}
              onChange={(e) => { setSearchTamTru(e.target.value); setPageTamTru(0); }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Box>
        )}

        {/* Tab content */}
        <TabPanel value={tabValue} index={0}>
          {loadingTamVang ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer sx={{ width: '100%' }}>
                <Table sx={{ width: '100%', tableLayout: 'fixed', '& .MuiTableCell-root': { fontSize: '0.95rem' } }} size="medium">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', width: '6%' }}>STT</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', width: '16%' }}>Họ và Tên</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', width: '16%' }}>Ngày bắt đầu</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', width: '16%' }}>Ngày kết thúc</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', width: '23%' }}>Nơi đến</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', width: '23%' }}>Lý do</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredTamVang
                      .slice(pageTamVang * rowsPerPageTamVang, pageTamVang * rowsPerPageTamVang + rowsPerPageTamVang)
                      .map((item, index) => (
                        <TableRow key={item.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                          <TableCell>{pageTamVang * rowsPerPageTamVang + index + 1}</TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600} noWrap>
                              {item.nhanKhauHoTen || 'N/A'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {item.nhanKhauId}
                            </Typography>
                          </TableCell>
                          <TableCell>{new Date(item.ngayBatDau).toLocaleDateString('vi-VN')}</TableCell>
                          <TableCell>{new Date(item.ngayKetThuc).toLocaleDateString('vi-VN')}</TableCell>
                          <TableCell>{item.noiDen}</TableCell>
                          <TableCell>{item.lyDo}</TableCell>
                        </TableRow>
                      ))}
                    {filteredTamVang.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                          <Typography variant="body2" color="text.secondary">
                            Không tìm thấy bản ghi tạm vắng nào
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              {/* Pagination moved below the table (outside Paper) to match other pages */}
            </>
          )}
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          {loadingTamTru ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer sx={{ width: '100%' }}>
                <Table sx={{ width: '100%', tableLayout: 'fixed', '& .MuiTableCell-root': { fontSize: '0.95rem' } }} size="medium">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', width: '6%' }}>STT</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', width: '20%' }}>Họ tên</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', width: '12%' }}>Ngày sinh</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', width: '20%' }}>Hộ khẩu tiếp nhận ID</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', width: '14%' }}>Ngày bắt đầu</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', width: '14%' }}>Ngày kết thúc</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', width: '14%' }}>Lý do</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredTamTru
                      .slice(pageTamTru * rowsPerPageTamTru, pageTamTru * rowsPerPageTamTru + rowsPerPageTamTru)
                      .map((item, index) => (
                        <TableRow key={item.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                          <TableCell>{pageTamTru * rowsPerPageTamTru + index + 1}</TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600} noWrap>
                              {item.hoTen}
                            </Typography>
                          </TableCell>
                          <TableCell>{item.ngaySinh ? new Date(item.ngaySinh).toLocaleDateString('vi-VN') : ''}</TableCell>
                          <TableCell>{item.hoKhauTiepNhanId}</TableCell>
                          <TableCell>{new Date(item.ngayBatDau).toLocaleDateString('vi-VN')}</TableCell>
                          <TableCell>{new Date(item.ngayKetThuc).toLocaleDateString('vi-VN')}</TableCell>
                          <TableCell>{item.lyDo}</TableCell>
                        </TableRow>
                      ))}
                    {filteredTamTru.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                          <Typography variant="body2" color="text.secondary">
                            Không tìm thấy bản ghi tạm trú nào
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              {/* Pagination moved below the table (outside Paper) to match other pages */}
            </>
          )}
        </TabPanel>
      </Paper>

      {/* Pagination area below the table, consistent with HoKhau/NhanKhau pages */}
      {tabValue === 0 ? (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredTamVang.length}
          rowsPerPage={rowsPerPageTamVang}
          page={pageTamVang}
          onPageChange={(_, newPage) => setPageTamVang(newPage)}
          onRowsPerPageChange={(event) => { setRowsPerPageTamVang(parseInt(event.target.value, 10)); setPageTamVang(0); }}
          labelRowsPerPage="Số hàng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count !== -1 ? count : to}`}
        />
      ) : (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredTamTru.length}
          rowsPerPage={rowsPerPageTamTru}
          page={pageTamTru}
          onPageChange={(_, newPage) => setPageTamTru(newPage)}
          onRowsPerPageChange={(event) => { setRowsPerPageTamTru(parseInt(event.target.value, 10)); setPageTamTru(0); }}
          labelRowsPerPage="Số hàng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count !== -1 ? count : to}`}
        />
      )}

      <TamVangForm open={tamVangFormOpen} onClose={() => setTamVangFormOpen(false)} onSubmit={handleCreateTamVang} />
      <TamTruForm open={tamTruFormOpen} onClose={() => setTamTruFormOpen(false)} onSubmit={handleCreateTamTru} />
    </Box>
  );
}
