// src/pages/DashboardPage.tsx

import { Box, CircularProgress, Typography, Paper, Divider } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PeopleIcon from '@mui/icons-material/People';
import HomeIcon from '@mui/icons-material/Home';
import GroupsIcon from '@mui/icons-material/Groups';
import TransferWithinAStationIcon from '@mui/icons-material/TransferWithinAStation';

// Sửa lại import
import { getThongKeDoTuoi, getThongKeTongQuan, getThongKeGioiTinh } from '../api/thongKeApi';
import { getAllTamVang } from '../api/tamVangApi';
import { getAllTamTru } from '../api/tamTruApi';
import type { ThongKeDoTuoi, ThongKeTongQuan } from '../api/thongKeApi';

import StatCard from '../components/dashboard/StatCard';
import DoTuoiChart from '../components/dashboard/DoTuoiChart';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tongQuanData, setTongQuanData] = useState<ThongKeTongQuan | null>(null);
  const [doTuoiData, setDoTuoiData] = useState<ThongKeDoTuoi | null>(null);
  const [gioiTinhData, setGioiTinhData] = useState<Map<string, number> | null>(null);
  const [soTamVang, setSoTamVang] = useState(0);
  const [soTamTru, setSoTamTru] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [tongQuanRes, doTuoiRes, gioiTinhRes, tamVangRes, tamTruRes] = await Promise.all([
          getThongKeTongQuan(),
          getThongKeDoTuoi(),
          getThongKeGioiTinh(),
          getAllTamVang(),
          getAllTamTru(),
        ]);
        setTongQuanData(tongQuanRes);
        setDoTuoiData(doTuoiRes);
        setGioiTinhData(gioiTinhRes);
        setSoTamVang(tamVangRes.data.length);
        setSoTamTru(tamTruRes.data.length);
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
          title="Tạm vắng" 
          value={soTamVang}
          icon={<TransferWithinAStationIcon sx={{ fontSize: 36 }} />}
          color="#ed6c02"
          detailLink="/tam-vang-tam-tru"
          onDetailClick={() => navigate('/tam-vang-tam-tru')}
        />
        <StatCard 
          title="Tạm trú" 
          value={soTamTru}
          icon={<GroupsIcon sx={{ fontSize: 36 }} />}
          color="#00bcd4"
          detailLink="/tam-vang-tam-tru"
          onDetailClick={() => navigate('/tam-vang-tam-tru')}
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
              const colors = ['#1976d2', '#2e7d32', '#ed6c02', '#00bcd4', '#d32f2f', '#7b1fa2'];
              const percent = soNhanKhau > 0 ? ((soLuong / soNhanKhau) * 100).toFixed(1) : 0;
              const labelMap: Record<string, string> = {
                '0-5': 'Mầm non (0-5)',
                '6-10': 'Cấp 1 (6-10)',
                '11-14': 'Cấp 2 (11-14)',
                '15-17': 'Cấp 3 (15-17)',
                '18-60': 'Độ tuổi lao động (18-60)',
                '>60': 'Nghỉ hưu (>60)',
              };
              
              return (
                <Box key={nhom}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>
                      {labelMap[nhom] || nhom}
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

          {gioiTinhData && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Phân bố theo giới tính
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {Object.entries(gioiTinhData).map(([gender, count], index) => {
                  const colors = ['#1976d2', '#f50057'];
                  const percent = soNhanKhau > 0 ? ((count / soNhanKhau) * 100).toFixed(1) : 0;
                  return (
                    <Box key={gender}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>
                          {gender}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {count} người ({percent}%)
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
            </Box>
          )}

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