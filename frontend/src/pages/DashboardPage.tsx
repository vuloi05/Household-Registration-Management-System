// src/pages/DashboardPage.tsx

import { Box, CircularProgress, Typography, Paper, Divider } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PeopleIcon from '@mui/icons-material/People';
import HomeIcon from '@mui/icons-material/Home';
import GroupsIcon from '@mui/icons-material/Groups';
import PersonIcon from '@mui/icons-material/Person';

// Sửa lại import
import { getThongKeDoTuoi, getThongKeTongQuan } from '../api/thongKeApi';
import type { ThongKeDoTuoi, ThongKeTongQuan } from '../api/thongKeApi';

import StatCard from '../components/dashboard/StatCard';
import DoTuoiChart from '../components/dashboard/DoTuoiChart';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tongQuanData, setTongQuanData] = useState<ThongKeTongQuan | null>(null);
  const [doTuoiData, setDoTuoiData] = useState<ThongKeDoTuoi | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [tongQuanRes, doTuoiRes] = await Promise.all([
          getThongKeTongQuan(),
          getThongKeDoTuoi()
        ]);
        setTongQuanData(tongQuanRes);
        setDoTuoiData(doTuoiRes);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={48} />
      </Box>
    );
  }

  // Tính toán các chỉ số
  const soHoKhau = tongQuanData?.soHoKhau ?? 0;
  const soNhanKhau = tongQuanData?.soNhanKhau ?? 0;
  const soTamTru = tongQuanData?.soTamTru ?? 0;
  const trungBinhNguoiTrenHo = soHoKhau > 0 ? (soNhanKhau / soHoKhau).toFixed(1) : 0;

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', p: { xs: 2, md: 0 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 700,
            color: 'text.primary',
            mb: 0.5
          }}
        >
          Bảng điều khiển
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Thống kê và phân tích dữ liệu quản lý hộ khẩu
        </Typography>
      </Box>
      
      {/* Thẻ thống kê chính */}
      <Box 
        sx={{
          display: 'grid',
          gap: 2.5,
          width: '100%',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)',
          },
          mb: 4
        }}
      >
        <StatCard 
          title="Tổng hộ khẩu" 
          value={soHoKhau}
          icon={<HomeIcon sx={{ fontSize: 36 }} />}
          color="#1976d2"
          detailLink="/ho-khau"
          onDetailClick={() => navigate('/ho-khau')}
        />
        <StatCard 
          title="Tổng nhân khẩu" 
          value={soNhanKhau}
          icon={<PeopleIcon sx={{ fontSize: 36 }} />}
          color="#2e7d32"
          detailLink="/nhan-khau"
          onDetailClick={() => navigate('/nhan-khau')}
        />
        <StatCard 
          title="Tạm trú" 
          value={soTamTru}
          icon={<GroupsIcon sx={{ fontSize: 36 }} />}
          color="#ed6c02"
        />
        <StatCard 
          title="TB người/hộ" 
          value={trungBinhNguoiTrenHo}
          icon={<PersonIcon sx={{ fontSize: 36 }} />}
          color="#00bcd4"
        />
      </Box>

      {/* Biểu đồ và thống kê chi tiết */}
      <Box 
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: {
            xs: '1fr',
            lg: '2fr 1fr'
          }
        }}
      >
        {/* Biểu đồ độ tuổi */}
        <Paper 
          elevation={0}
          sx={{ 
            p: 3,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Phân bố theo độ tuổi
          </Typography>
          <Divider sx={{ mb: 3 }} />
          {doTuoiData && <DoTuoiChart data={doTuoiData} />}
        </Paper>

        {/* Thống kê chi tiết */}
        <Paper 
          elevation={0}
          sx={{ 
            p: 3,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Chi tiết phân loại
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {doTuoiData && Object.entries(doTuoiData).map(([nhom, soLuong], index) => {
              const colors = ['#1976d2', '#2e7d32', '#ed6c02', '#00bcd4'];
              const percent = soNhanKhau > 0 ? ((soLuong / soNhanKhau) * 100).toFixed(1) : 0;
              
              return (
                <Box key={nhom}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>
                      {nhom}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {soLuong} người ({percent}%)
                    </Typography>
                  </Box>
                  <Box 
                    sx={{ 
                      width: '100%', 
                      height: 8, 
                      bgcolor: 'grey.200', 
                      borderRadius: 1,
                      overflow: 'hidden'
                    }}
                  >
                    <Box 
                      sx={{ 
                        width: `${percent}%`, 
                        height: '100%', 
                        bgcolor: colors[index % colors.length],
                        transition: 'width 0.5s ease-in-out'
                      }} 
                    />
                  </Box>
                </Box>
              );
            })}
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Thống kê tóm tắt */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                Tổng số hộ
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {soHoKhau} hộ
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                Tổng nhân khẩu
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {soNhanKhau} người
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                Tỷ lệ tạm trú
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {soNhanKhau > 0 ? ((soTamTru / soNhanKhau) * 100).toFixed(1) : 0}%
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

    </Box>
  );
}