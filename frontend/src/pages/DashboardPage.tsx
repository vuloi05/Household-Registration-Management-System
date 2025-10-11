// src/pages/DashboardPage.tsx

import { Box, CircularProgress, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import PeopleIcon from '@mui/icons-material/People';
import HomeIcon from '@mui/icons-material/Home';

// Sửa lại import
import { getThongKeDoTuoi, getThongKeTongQuan } from '../api/thongKeApi';
import type { ThongKeDoTuoi, ThongKeTongQuan } from '../api/thongKeApi';

import StatCard from '../components/dashboard/StatCard';
import DoTuoiChart from '../components/dashboard/DoTuoiChart';

export default function DashboardPage() {
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
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>Bảng điều khiển</Typography>
      
      {/* <<<< SỬA LỖI Ở ĐÂY: Dùng Box với Flexbox thay cho Grid >>>> */}
      {/* Container chính cho các thẻ StatCard */}
      <Box 
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: {
            xs: '1fr', // 1 cột trên màn hình nhỏ
            sm: '1fr 1fr', // 2 cột trên màn hình vừa
            md: '1fr 1fr 1fr', // 3 cột trên màn hình lớn
          }
        }}
      >
        <StatCard 
          title="Tổng số Hộ khẩu" 
          value={tongQuanData?.soHoKhau ?? 0}
          icon={<HomeIcon sx={{ fontSize: 40 }} />}
          color="primary.main"
        />
        <StatCard 
          title="Tổng số Nhân khẩu" 
          value={tongQuanData?.soNhanKhau ?? 0}
          icon={<PeopleIcon sx={{ fontSize: 40 }} />}
          color="success.main"
        />
        {/* Có thể thêm thẻ thứ 3 ở đây sau */}
      </Box>

      {/* Biểu đồ độ tuổi */}
      <Box sx={{ mt: 4 }}>
        {doTuoiData && <DoTuoiChart data={doTuoiData} />}
      </Box>

    </Box>
  );
}