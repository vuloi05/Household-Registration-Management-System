// src/components/shared/LanguageSwitcher.tsx

import { useTranslation } from 'react-i18next';
import { Box, Button } from '@mui/material';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <Box>
      <Button 
        color="inherit" 
        onClick={() => handleLanguageChange('vi')}
        sx={{ fontWeight: i18n.language === 'vi' ? 'bold' : 'normal' }}
      >
        VI
      </Button>
      <Button 
        color="inherit" 
        onClick={() => handleLanguageChange('ja')}
        sx={{ fontWeight: i18n.language === 'ja' ? 'bold' : 'normal' }}
      >
        JP
      </Button>
    </Box>
  );
}
