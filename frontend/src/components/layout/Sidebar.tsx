// src/components/layout/Sidebar.tsx

import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import PaymentsIcon from '@mui/icons-material/Payments';
import LogoutIcon from '@mui/icons-material/Logout';
import { Link as RouterLink, useLocation } from 'react-router-dom'; // 1. Import thêm Link và useLocation

// Mảng chứa thông tin các mục menu để dễ quản lý
const menuItems = [
  { text: 'Bảng điều khiển', icon: <DashboardIcon />, path: '/' },
  { text: 'Quản lý Nhân khẩu', icon: <PeopleIcon />, path: '/nhan-khau' },
  { text: 'Quản lý Thu phí', icon: <PaymentsIcon />, path: '/thu-phi' }, // Thêm path cho thu phí
];

const bottomMenu = [
  { text: 'Đăng xuất', icon: <LogoutIcon />, path: '/logout' },
];

const drawerWidth = 240;

export default function Sidebar() {
  const location = useLocation(); // 2. Lấy vị trí URL hiện tại

  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',

          display: 'flex',//thêm display flex để đăng xuất xuống cuối sidebar
          flexDirection: 'column',
          justifyContent: 'space-between',


        },
      }}
      variant="permanent"
      anchor="left"
    >
      <Box>
      <Toolbar />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            {/* 3. Bọc ListItemButton trong RouterLink */}
            <ListItemButton
              component={RouterLink}
              to={item.path}
              // 4. Thêm style để highlight mục đang được chọn
              selected={location.pathname === item.path}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      </Box>


      <Box>          
        <List>
          {bottomMenu.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                component={RouterLink}
                to={item.path}
                selected={location.pathname === item.path}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>



    </Drawer>
  );
}