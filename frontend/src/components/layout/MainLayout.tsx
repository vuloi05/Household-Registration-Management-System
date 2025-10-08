// src/components/layout/MainLayout.tsx
import { Box, CssBaseline, Toolbar } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';

// props `children` sẽ là nội dung của từng trang cụ thể
export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Header />
      <Sidebar />
      <Box
        component="main"
        sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3 }}
      >
        <Toolbar /> {/* Để tạo khoảng trống bên dưới Header */}
        {children}
      </Box>
    </Box>
  );
}