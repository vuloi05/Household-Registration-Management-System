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
import { useTranslation } from 'react-i18next';

const drawerWidth = 240;

export default function Sidebar() {
  const { t } = useTranslation('layout');
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const menuItems = [
    { key: 'sidebar_dashboard', icon: <DashboardIcon />, path: '/dashboard', roles: ['ROLE_ADMIN', 'ROLE_ACCOUNTANT'] },
    { key: 'sidebar_user_management', icon: <ManageAccountsIcon />, path: '/quan-ly-nguoi-dung', roles: ['ROLE_ADMIN'] },
    { key: 'sidebar_household_management', icon: <PeopleIcon />, path: '/ho-khau', roles: ['ROLE_ADMIN'] },
    { key: 'sidebar_person_management', icon: <PersonIcon />, path: '/nhan-khau', roles: ['ROLE_ADMIN'] },
    { key: 'sidebar_change_history', icon: <HistoryIcon />, path: '/lich-su-bien-dong', roles: ['ROLE_ADMIN'] },
    { key: 'sidebar_absence_residence', icon: <TransferWithinAStationIcon />, path: '/tam-vang-tam-tru', roles: ['ROLE_ADMIN'] },
    { key: 'sidebar_fee_management', icon: <PaymentsIcon />, path: '/thu-phi', roles: ['ROLE_ADMIN', 'ROLE_ACCOUNTANT'] },
  ];

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const accessibleMenuItems = menuItems.filter(item => 
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
          {t('greeting', { name: user?.sub })}
        </Typography>
      </Toolbar>
      <List>
        {accessibleMenuItems.map((item) => (
          <ListItem key={item.key} disablePadding>
            <ListItemButton
              component={RouterLink}
              to={item.path}
              selected={location.pathname === item.path}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={t(item.key)} />
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
          {t('logout')}
        </Button>
      </Box>
    </Drawer>
  );
}