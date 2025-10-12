// src/routes/index.tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import DashboardPage from '../pages/DashboardPage';
import LoginPage from '../pages/LoginPage';
import NhanKhauPage from '../pages/NhanKhauPage';
import ThuPhiPage from '../pages/ThuPhiPage';
import HoKhauDetailPage from '../pages/HoKhauDetailPage';


const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  // 2. Nhóm các route cần bảo vệ làm con của ProtectedRoute
  {
    path: '/',
    element: <ProtectedRoute />, // "Gác cổng" ở đây
    children: [
      {
        path: '/', // Trang chủ
        element: <DashboardPage />,
      },
      {
        path: '/nhan-khau',
        element: <NhanKhauPage />,
      },
      {
        path: '/hokhau/:hoKhauId',
        element: <HoKhauDetailPage />,
      },
      {
        path: '/thu-phi',
        element: <ThuPhiPage />,
      },
      // Thêm các route cần bảo vệ khác vào đây
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}