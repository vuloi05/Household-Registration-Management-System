// src/theme/index.ts
import { MD3LightTheme } from 'react-native-paper';

export const appTheme = {
  colors: {
    primary: '#D32F2F', // Màu đỏ cờ - đồng bộ với frontend
    primaryLight: '#FF6659',
    primaryDark: '#9A0007',
    background: '#f4f6f8', // Màu nền xám nhạt
    paper: '#ffffff',
    text: {
      primary: '#212121',
      secondary: '#616161',
      disabled: '#9E9E9E',
    },
    error: '#D32F2F',
    success: '#2E7D32',
    warning: '#ED6C02',
    info: '#0288D1',
    border: '#E0E0E0',
    divider: '#E0E0E0',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    small: 8,
    medium: 12,
    large: 16,
    xlarge: 24,
  },
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: '700' as const,
      lineHeight: 40,
    },
    h2: {
      fontSize: 24,
      fontWeight: '700' as const,
      lineHeight: 32,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 28,
    },
    body1: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 24,
    },
    body2: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 20,
    },
    button: {
      fontSize: 16,
      fontWeight: '600' as const,
      lineHeight: 24,
    },
  },
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.2,
      shadowRadius: 24,
      elevation: 8,
    },
  },
};

// Theme cho react-native-paper
export const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: appTheme.colors.primary,
    primaryContainer: appTheme.colors.primaryLight,
    error: appTheme.colors.error,
    background: appTheme.colors.background,
    surface: appTheme.colors.paper,
    onPrimary: '#ffffff',
    onBackground: appTheme.colors.text.primary,
    onSurface: appTheme.colors.text.primary,
  },
};

// Export theme để tương thích với code cũ
export const theme = appTheme;

export type Theme = typeof appTheme;

