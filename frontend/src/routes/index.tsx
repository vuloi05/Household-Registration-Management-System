// src/routes/index.tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import DashboardPage from '../pages/DashboardPage';
import LoginPage from '../pages/LoginPage';
import NhanKhauPage from '../pages/NhanKhauPage';
import ThuPhiPage from '../pages/ThuPhiPage';
import HoKhauDetailPage from '../pages/HoKhauDetailPage';

// Giả sử người dùng đã đăng nhập
const isAuthenticated = true; 

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: isAuthenticated ? (
      <MainLayout>
        <DashboardPage />
      </MainLayout>
    ) : (
      <LoginPage /> // Nếu chưa đăng nhập, chuyển về trang login
    ),
  },
  {
    path: '/nhan-khau',
    element: (
      <MainLayout>
        <NhanKhauPage />
      </MainLayout>
    ),
  },
  {
    path: '/thu-phi',
    element: (
      <MainLayout>
        <ThuPhiPage />
      </MainLayout>
    ),
  },
  {
    path: '/hokhau/:hoKhauId', // `:hoKhauId` là một tham số động
    element: (
      <MainLayout>
        <HoKhauDetailPage />
      </MainLayout>
    ),
  },
  // Thêm các route khác ở đây
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}