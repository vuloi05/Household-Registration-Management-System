// src/components/dashboard/DoTuoiChart.tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import type { ThongKeDoTuoi } from '../../api/thongKeApi';

interface DoTuoiChartProps {
  data: ThongKeDoTuoi;
}

export default function DoTuoiChart({ data }: DoTuoiChartProps) {
  // Chuyển đổi object Map thành mảng để Recharts có thể sử dụng
  const chartData = Object.entries(data).map(([name, value]) => ({ 
    name, 
    'Số người': value 
  }));

  // Màu sắc cho từng cột
  const colors = ['#1976d2', '#2e7d32', '#ed6c02', '#00bcd4'];

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart 
        data={chartData}
        margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="name" 
          tick={{ fill: '#666', fontSize: 13 }}
          axisLine={{ stroke: '#e0e0e0' }}
        />
        <YAxis 
          tick={{ fill: '#666', fontSize: 13 }}
          axisLine={{ stroke: '#e0e0e0' }}
        />
        <Tooltip 
          cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e0e0e0',
            borderRadius: 8,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        />
        <Legend 
          wrapperStyle={{ paddingTop: 10 }}
          iconType="circle"
        />
        <Bar 
          dataKey="Số người" 
          radius={[8, 8, 0, 0]}
          maxBarSize={60}
        >
          {chartData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}