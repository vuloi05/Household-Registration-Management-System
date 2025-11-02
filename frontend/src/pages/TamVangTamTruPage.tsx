// src/pages/TamVangTamTruPage.tsx

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tab,
  Tabs,
  Paper,
  Button,
  Table, TableHead, TableRow, TableCell, TableBody, TableContainer
} from '@mui/material';
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

  const [tamVangFormOpen, setTamVangFormOpen] = useState(false);
  const [tamTruFormOpen, setTamTruFormOpen] = useState(false);

  const fetchTamVang = async () => {
    try {
      const response = await getAllTamVang();
      setTamVangList(response.data);
    } catch (error) {
      enqueueSnackbar('Không thể tải danh sách tạm vắng', { variant: 'error' });
    }
  };

  const fetchTamTru = async () => {
    try {
      const response = await getAllTamTru();
      setTamTruList(response.data);
    } catch (error) {
      enqueueSnackbar('Không thể tải danh sách tạm trú', { variant: 'error' });
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

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
        Quản lý Tạm vắng / Tạm trú
      </Typography>

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="tạm vắng tạm trú tabs">
            <Tab label="Tạm vắng" />
            <Tab label="Tạm trú" />
          </Tabs>
        </Box>
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button variant="contained" onClick={() => setTamVangFormOpen(true)}>Thêm Tạm vắng</Button>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nhân khẩu ID</TableCell>
                  <TableCell>Ngày bắt đầu</TableCell>
                  <TableCell>Ngày kết thúc</TableCell>
                  <TableCell>Nơi đến</TableCell>
                  <TableCell>Lý do</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tamVangList.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>{item.nhanKhauId}</TableCell>
                    <TableCell>{new Date(item.ngayBatDau).toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell>{new Date(item.ngayKetThuc).toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell>{item.noiDen}</TableCell>
                    <TableCell>{item.lyDo}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button variant="contained" onClick={() => setTamTruFormOpen(true)}>Thêm Tạm trú</Button>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Họ tên</TableCell>
                  <TableCell>Ngày sinh</TableCell>
                  <TableCell>Hộ khẩu tiếp nhận ID</TableCell>
                  <TableCell>Ngày bắt đầu</TableCell>
                  <TableCell>Ngày kết thúc</TableCell>
                  <TableCell>Lý do</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tamTruList.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>{item.hoTen}</TableCell>
                    <TableCell>{item.ngaySinh ? new Date(item.ngaySinh).toLocaleDateString('vi-VN') : ''}</TableCell>
                    <TableCell>{item.hoKhauTiepNhanId}</TableCell>
                    <TableCell>{new Date(item.ngayBatDau).toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell>{new Date(item.ngayKetThuc).toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell>{item.lyDo}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>

      <TamVangForm open={tamVangFormOpen} onClose={() => setTamVangFormOpen(false)} onSubmit={handleCreateTamVang} />
      <TamTruForm open={tamTruFormOpen} onClose={() => setTamTruFormOpen(false)} onSubmit={handleCreateTamTru} />
    </Box>
  );
}
