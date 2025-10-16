// src/utils/tokenUtils.ts

// Hàm để xóa tất cả token
export const clearTokens = () => {
  localStorage.removeItem('jwt_token');
  localStorage.removeItem('refresh_token');
  console.log('Tokens cleared from localStorage');
};

// Hàm để kiểm tra và xóa token expired
export const checkAndClearExpiredTokens = () => {
  const token = localStorage.getItem('jwt_token');
  if (token) {
    try {
      // Decode JWT để kiểm tra expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      if (payload.exp && payload.exp < currentTime) {
        console.log('Token expired, clearing tokens...');
        clearTokens();
        return true;
      }
    } catch (error) {
      console.log('Invalid token format, clearing tokens...');
      clearTokens();
      return true;
    }
  }
  return false;
};

// Hàm để kiểm tra token có hợp lệ không
export const isTokenValid = (): boolean => {
  const token = localStorage.getItem('jwt_token');
  if (!token) return false;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp && payload.exp > currentTime;
  } catch (error) {
    return false;
  }
};
