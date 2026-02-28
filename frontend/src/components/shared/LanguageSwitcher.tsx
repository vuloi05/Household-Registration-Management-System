// src/components/shared/LanguageSwitcher.tsx

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Menu, MenuItem, IconButton, Typography } from '@mui/material';
import { GlobeHemisphereEast as GlobeHemisphereEastIcon } from '@phosphor-icons/react'; // Sử dụng icon quả địa cầu

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    handleClose();
  };

  const currentLanguage = i18n.language;

  return (
    <Box>
      <IconButton
        aria-label="select language"
        aria-controls={open ? 'language-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        color="inherit"
        sx={{
          padding: { xs: '6px', md: '8px' }, // Smaller padding on mobile
          fontSize: { xs: '1.2rem', md: '1.5rem' }, // Smaller icon on mobile
          '& .MuiSvgIcon-root': {
            fontSize: 'inherit', // Ensure the icon itself respects the fontSize
          },
        }}
      >
        <GlobeHemisphereEastIcon weight="bold" /> {/* Icon quả địa cầu */}
      </IconButton>
      <Menu
        id="language-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'select-language-button',
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem
          onClick={() => handleLanguageChange('vi')}
          selected={currentLanguage === 'vi'}
        >
          <img src="/flags/vn.png" alt="Vietnamese Flag" style={{ width: 20, marginRight: 8 }} />
          <Typography variant="body2">VN (Tiếng Việt)</Typography>
        </MenuItem>
        <MenuItem
          onClick={() => handleLanguageChange('ja')}
          selected={currentLanguage === 'ja'}
        >
          <img src="/flags/jp.png" alt="Japanese Flag" style={{ width: 20, marginRight: 8 }} />
          <Typography variant="body2">JP (日本語)</Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
}
