// src/pages/KhoanThuDetailPage.tsx

import { Box, Typography, Paper, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import PeopleIcon from '@mui/icons-material/People';
import PaidIcon from '@mui/icons-material/Paid';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StatCard from '../components/dashboard/StatCard';

import { getKhoanThuById, getLichSuNopTienByKhoanThuId, getThongKeKhoanThu } from '../api/khoanThuApi';
import type { KhoanThu, ThongKeKhoanThu } from '../api/khoanThuApi';
import type { LichSuNopTien } from '../api/nopTienApi';

const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

export default function KhoanThuDetailPage() {
  const { khoanThuId } = useParams<{ khoanThuId: string }>();
  const navigate = useNavigate();
  const [khoanThu, setKhoanThu] = useState<KhoanThu | null>(null);
  const [lichSuList, setLichSuList] = useState<LichSuNopTien[]>([]);
  const [thongKe, setThongKe] = useState<ThongKeKhoanThu | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (khoanThuId) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const id = parseInt(khoanThuId, 10);
          const [khoanThuData, lichSuData, thongKeData] = await Promise.all([
            getKhoanThuById(id),
            getLichSuNopTienByKhoanThuId(id),
            getThongKeKhoanThu(id)
          ]);
          setKhoanThu(khoanThuData);
          setLichSuList(lichSuData);
          setThongKe(thongKeData);
        } catch (error) { console.error('Failed to fetch details:', error); } 
        finally { setLoading(false); }
      };
      fetchData();
    }
  }, [khoanThuId]);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  if (!khoanThu || !thongKe) {
    return <Typography>Không tìm thấy thông tin khoản thu.</Typography>;
  }

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      {/* Nút quay lại */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/thu-phi')}
        sx={{ mb: 2 }}
        variant="outlined"
      >
        Quay lại
      </Button>

      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
        Chi tiết Khoản thu: {khoanThu.tenKhoanThu}
      </Typography>

      {/* <<<< SỬA LỖI Ở ĐÂY: Dùng Box với CSS Grid thay cho component Grid >>>> */}
      <Box 
        sx={{
          display: 'grid',
          gap: 3,
          mb: 3,
          width: '100%',
          gridTemplateColumns: {
            xs: '1fr', // 1 cột trên màn hình nhỏ
            sm: '1fr 1fr', // 2 cột trên màn hình vừa
          }
        }}
      >
        <StatCard 
            title="Số hộ đã nộp" 
            value={`${thongKe.soHoDaNop} / ${thongKe.tongSoHo}`}
            icon={<PeopleIcon sx={{ fontSize: 40 }} />}
            color="info.main"
        />
        <StatCard 
            title="Tổng số tiền đã thu" 
            value={formatCurrency(thongKe.tongSoTien)}
            icon={<PaidIcon sx={{ fontSize: 40 }} />}
            color="success.main"
        />
      </Box>
      
      <Paper sx={{ p: 2, width: '100%' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Danh sách các hộ đã nộp</Typography>
        <TableContainer sx={{ width: '100%' }}>
          <Table sx={{ width: '100%', tableLayout: 'fixed' }}>
            <TableHead>
                <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>Họ tên Chủ hộ</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', width: '40%' }}>Địa chỉ</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', width: '20%' }}>Ngày nộp</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', width: '10%' }}>Số tiền</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {lichSuList.map((item) => (
                    <TableRow key={item.id}>
                        <TableCell>{item.hoKhau.chuHo?.hoTen}</TableCell>
                        <TableCell>{item.hoKhau.diaChi}</TableCell> 
                        <TableCell>{item.ngayNop}</TableCell>
                        <TableCell align="right">{formatCurrency(item.soTien)}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}