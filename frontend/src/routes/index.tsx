// src/routes/index.tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import DashboardPage from '../pages/DashboardPage';
import LoginPage from '../pages/LoginPage';
import HomePage from '../pages/Home';
import HoKhauPage from '../pages/HoKhauPage';
import NhanKhauPage from '../pages/NhanKhauPage';
import ThuPhiPage from '../pages/ThuPhiPage';
import HoKhauDetailPage from '../pages/HoKhauDetailPage';
import KhoanThuDetailPage from '../pages/KhoanThuDetailPage';
import LichSuBienDongPage from '../pages/LichSuBienDongPage';
import TamVangTamTruPage from '../pages/TamVangTamTruPage';
import UserPage from '../pages/UserPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  // Nhóm các route cần bảo vệ làm con của ProtectedRoute
  {
    element: <ProtectedRoute />, // "Gác cổng" ở đây
    children: [
      {
        path: '/dashboard', // Trang dashboard
        element: <DashboardPage />,
      },
      {
        path: '/ho-khau',
        element: <HoKhauPage />,
      },
      {
        path: '/nhan-khau',
        element: <NhanKhauPage />,
      },
      {
        path: '/ho-khau/:maHoKhau',
        element: <HoKhauDetailPage />,
      },
      {
        path: '/lich-su-bien-dong',
        element: <LichSuBienDongPage />,
      },
      {
        path: '/tam-vang-tam-tru',
        element: <TamVangTamTruPage />,
      },
      {
        path: '/thu-phi',
        element: <ThuPhiPage />,
      },
      {
        path: '/thu-phi/:khoanThuId',
        element: <KhoanThuDetailPage />,
      },
      {
        path: '/quan-ly-nguoi-dung',
        element: <UserPage />,
      },
      // Thêm các route cần bảo vệ khác vào đây
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}