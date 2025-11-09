// src/utils/tokenUtils.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  exp?: number;
  sub?: string;
  role?: string;
}

// Kiểm tra và xóa token hết hạn
export const checkAndClearExpiredTokens = async (): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem('jwt_token');
    const refreshToken = await AsyncStorage.getItem('refresh_token');
    
    let hasExpired = false;
    
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
          hasExpired = true;
        }
      } catch (error) {
        // Token không hợp lệ
        hasExpired = true;
      }
    }
    
    if (refreshToken) {
      try {
        const decoded = jwtDecode<DecodedToken>(refreshToken);
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
          hasExpired = true;
        }
      } catch (error) {
        // Token không hợp lệ
        hasExpired = true;
      }
    }
    
    if (hasExpired) {
      await AsyncStorage.multiRemove(['jwt_token', 'refresh_token']);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking tokens:', error);
    return false;
  }
};

// Xóa tất cả tokens
export const clearTokens = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove(['jwt_token', 'refresh_token']);
  } catch (error) {
    console.error('Error clearing tokens:', error);
  }
};

