// src/components/layout/Sidebar.tsx

import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import PaymentsIcon from '@mui/icons-material/Payments';
import { useAuth } from '../../context/AuthContext'; // Import hook useAuth
import { Link as RouterLink, useLocation } from 'react-router-dom';

/**
 * Mảng cấu hình cho các mục menu trong Sidebar.
 * Mỗi mục có:
 * - text: Văn bản hiển thị.
 * - icon: Biểu tượng (component từ MUI).
 * - path: Đường dẫn URL khi click vào.
 * - roles: Mảng các vai trò được phép nhìn thấy mục menu này.
 */
const menuItems = [
  { text: 'Bảng điều khiển', icon: <DashboardIcon />, path: '/', roles: ['ROLE_ADMIN', 'ROLE_ACCOUNTANT'] },
  { text: 'Quản lý Hộ khẩu', icon: <PeopleIcon />, path: '/ho-khau', roles: ['ROLE_ADMIN'] },
  { text: 'Quản lý Thu phí', icon: <PaymentsIcon />, path: '/thu-phi', roles: ['ROLE_ADMIN', 'ROLE_ACCOUNTANT'] },
];

const drawerWidth = 240;

export default function Sidebar() {
  const location = useLocation(); // Hook để lấy URL hiện tại, giúp highlight mục menu đang active.
  const { user } = useAuth(); // Lấy thông tin user (bao gồm cả role) từ AuthContext.

  /**
   * Lọc danh sách menuItems ban đầu để chỉ giữ lại những mục mà
   * vai trò (role) của người dùng hiện tại được phép truy cập.
   */
  const accessibleMenuItems = menuItems.filter(item => 
    // Kiểm tra xem user có tồn tại và role của user có nằm trong danh sách roles của mục menu không.
    user && item.roles.includes(user.role)
  );

  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
      variant="permanent"
      anchor="left"
    >
      <Toolbar />
      <List>
        {/* 
          Sử dụng `accessibleMenuItems` (danh sách đã được lọc) thay vì `menuItems` (danh sách gốc) 
          để render ra các mục menu.
        */}
        {accessibleMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            {/* Bọc ListItemButton trong RouterLink để xử lý điều hướng */}
            <ListItemButton
              component={RouterLink}
              to={item.path}
              // Thêm style 'selected' để highlight mục menu đang được chọn
              selected={location.pathname === item.path}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}