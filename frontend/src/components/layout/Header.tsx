// src/components/layout/Header.tsx
import { AppBar, Toolbar, Typography } from '@mui/material';

const drawerWidth = 240;

export default function Header() {

  return (
    <AppBar
      position="fixed"
      sx={{ 
        width: `calc(100% - ${drawerWidth}px)`, 
        ml: `${drawerWidth}px`,
        zIndex: (theme) => theme.zIndex.drawer + 1,
        boxSizing: 'border-box'
      }}
    >
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          Hệ thống Quản lý Dân Cư
        </Typography>
      </Toolbar>
    </AppBar>
  );
}