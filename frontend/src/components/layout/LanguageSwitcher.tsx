// src/components/layout/LanguageSwitcher.tsx
import React from 'react';
import { IconButton, Menu, MenuItem, Tooltip, Box } from '@mui/material';
import { Language as LanguageIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'vi', name: 'Tiếng Việt', flag: '/flags/vn.png' },
  { code: 'ja', name: '日本語', flag: '/flags/jp.png' },
];

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    handleClose();
  };

  const currentLanguage = languages.find((lang) => lang.code === i18n.language) || languages[0];

  return (
    <>
      <Tooltip title="Change Language">
        <IconButton
          onClick={handleClick}
          color="inherit"
          sx={{
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <img 
              src={currentLanguage.flag} 
              alt={currentLanguage.name}
              style={{ width: 24, height: 16, objectFit: 'cover', borderRadius: 2 }}
            />
            <LanguageIcon sx={{ fontSize: 20 }} />
          </Box>
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 150,
          },
        }}
      >
        {languages.map((lang) => (
          <MenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            selected={i18n.language === lang.code}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <img 
                src={lang.flag} 
                alt={lang.name}
                style={{ width: 24, height: 16, objectFit: 'cover', borderRadius: 2 }}
              />
              <span>{lang.name}</span>
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
