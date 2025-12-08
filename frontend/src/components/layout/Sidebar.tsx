// src/components/layout/Sidebar.tsx

import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Box, Typography, Button } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import PaymentsIcon from '@mui/icons-material/Payments';
import TransferWithinAStationIcon from '@mui/icons-material/TransferWithinAStation';
import HistoryIcon from '@mui/icons-material/History';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import { useAuth } from '../../context/AuthContext'; // Import hook useAuth
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';

/**
 * Mảng cấu hình cho các mục menu trong Sidebar.
 * Mỗi mục có:
 * - text: Văn bản hiển thị.
 * - icon: Biểu tượng (component từ MUI).
 * - path: Đường dẫn URL khi click vào.
 * - roles: Mảng các vai trò được phép nhìn thấy mục menu này.
 */
const menuItems = [
  { text: 'Bảng điều khiển', icon: <DashboardIcon />, path: '/dashboard', roles: ['ROLE_ADMIN', 'ROLE_ACCOUNTANT'] },
  { text: 'Quản lý Người dùng', icon: <ManageAccountsIcon />, path: '/quan-ly-nguoi-dung', roles: ['ROLE_ADMIN'] },
  { text: 'Quản lý Hộ khẩu', icon: <PeopleIcon />, path: '/ho-khau', roles: ['ROLE_ADMIN'] },
  { text: 'Quản lý Nhân khẩu', icon: <PersonIcon />, path: '/nhan-khau', roles: ['ROLE_ADMIN'] },
  { text: 'Lịch sử Biến động', icon: <HistoryIcon />, path: '/lich-su-bien-dong', roles: ['ROLE_ADMIN'] },
  { text: 'Tạm vắng / Tạm trú', icon: <TransferWithinAStationIcon />, path: '/tam-vang-tam-tru', roles: ['ROLE_ADMIN'] },
  { text: 'Quản lý Thu phí', icon: <PaymentsIcon />, path: '/thu-phi', roles: ['ROLE_ADMIN', 'ROLE_ACCOUNTANT'] },
];

const drawerWidth = 240;

export default function Sidebar() {
  const location = useLocation(); // Hook để lấy URL hiện tại, giúp highlight mục menu đang active.
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // Lấy thông tin user và logout

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

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
      {/* Greeting at top */}
      <Toolbar>
        <Typography variant="subtitle1" noWrap sx={{ fontWeight: 700 }}>
          Chào, {user?.sub}
        </Typography>
      </Toolbar>
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
      {/* Spacer to push logout to bottom */}
      <Box sx={{ flexGrow: 1 }} />
      {/* Logout button at bottom */}
      <Box sx={{ px: 1.5, py: 1.5 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
        >
          Đăng xuất
        </Button>
      </Box>
    </Drawer>
  );
}