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
          bgcolor: 'background.default',
          p: 3,            // thêm padding 3 (khoảng 24px) cho nội dung
          mt: '72px',      // đẩy xuống cách header khoảng 8px (64 + 8)
          ml: '8px',       // cách sidebar một chút
          minHeight: '100vh',
          borderRadius: '12px', // tuỳ chọn: bo góc nhẹ cho đẹp
        }}
      >
        {children}
      </Box>
    </Box>
  );
}