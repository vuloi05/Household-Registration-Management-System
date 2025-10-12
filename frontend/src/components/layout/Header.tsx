// src/components/layout/Header.tsx
import { AppBar, Toolbar, Typography, IconButton } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../../context/AuthContext';

const drawerWidth = 240;

export default function Header() {
  const { logout, user } = useAuth(); // 2. Lấy hàm logout và thông tin user

  return (
    <AppBar
      position="fixed"
      sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }}
    >
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          Hệ thống Quản lý Nhân khẩu
        </Typography>
        
        {/* Chào người dùng */}
        <Typography sx={{ mr: 2 }}>Chào, {user?.sub}</Typography> 
        
        {/* 3. Thêm nút Logout */}
        <IconButton title="Đăng xuất" color="inherit" onClick={logout}>
          <LogoutIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}