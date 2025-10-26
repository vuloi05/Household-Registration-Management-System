// src/components/layout/MainLayout.tsx
import { Box, CssBaseline } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Header />
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%',
          maxWidth: '100%',
          bgcolor: 'background.default',
          pt: 3,           // padding top
          pr: 3,           // padding right
          pb: 3,           // padding bottom
          pl: 5,           // padding left lớn hơn để tạo khoảng cách với sidebar sau khi kéo dài
          mt: '72px',      // đẩy xuống cách header
          ml: '-8px',      // Kéo dài ra trái để che khoảng trống màu đen
          minHeight: 'calc(100vh - 72px)', // Điều chỉnh theo margin-top ban đầu
          borderRadius: '12px', // tuỳ chọn: bo góc nhẹ cho đẹp
          boxSizing: 'border-box', // đảm bảo padding được tính trong width
          overflowY: 'auto', // Cho phép cuộn dọc khi cần thiết
          overflowX: 'hidden', // Ngăn cuộn ngang
        }}
      >
        {children}
      </Box>
    </Box>
  );
}