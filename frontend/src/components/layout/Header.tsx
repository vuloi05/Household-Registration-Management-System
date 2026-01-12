// src/components/layout/Header.tsx
import { AppBar, Toolbar, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import NotificationButton from '../notifications/NotificationButton';
import LanguageSwitcher from '../shared/LanguageSwitcher';

const drawerWidth = 240;

export default function Header() {
  const { t } = useTranslation('layout');

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
          {t('layout:header_title')}
        </Typography>
        <LanguageSwitcher />
        <NotificationButton />
      </Toolbar>
    </AppBar>
  );
}