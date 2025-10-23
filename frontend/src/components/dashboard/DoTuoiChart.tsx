// src/components/dashboard/DoTuoiChart.tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Paper, Typography } from '@mui/material';
import type { ThongKeDoTuoi } from '../../api/thongKeApi';

interface DoTuoiChartProps {
  data: ThongKeDoTuoi;
}

export default function DoTuoiChart({ data }: DoTuoiChartProps) {
  // Chuyển đổi object Map thành mảng để Recharts có thể sử dụng
  const chartData = Object.entries(data).map(([name, value]) => ({ name, 'Số lượng': value }));

  return (
    <Paper sx={{ p: 2, height: '400px', width: '100%' }}>
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Thống kê theo Độ tuổi</Typography>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="Số lượng" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
}