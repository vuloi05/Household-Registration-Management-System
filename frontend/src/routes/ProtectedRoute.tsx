// src/routes/ProtectedRoute.tsx

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../components/layout/MainLayout';

export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // Nếu người dùng chưa được xác thực, chuyển hướng họ về trang login
    return <Navigate to="/login" replace />;
  }

  // Nếu đã được xác thực, render layout chính và nội dung của trang con (qua Outlet)
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
}