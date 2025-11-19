// src/routes/ProtectedRoute.tsx

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../components/layout/MainLayout';
import { Box, CircularProgress, Typography } from '@mui/material';

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  // Hiển thị loading spinner khi đang kiểm tra authentication
  if (isLoading) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        gap={2}
      >
        <CircularProgress />
        <Typography variant="body1">Đang kiểm tra đăng nhập...</Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    // Nếu người dùng chưa được xác thực, chuyển hướng họ về trang home
    return <Navigate to="/" replace />;
  }

  // Nếu đã được xác thực, render layout chính và nội dung của trang con (qua Outlet)
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
}