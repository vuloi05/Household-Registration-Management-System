// src/api/axiosClient.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';

const BASE_URL = API_BASE_URL;

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 giây timeout
});

// Biến để tránh refresh token nhiều lần đồng thời
let isRefreshing = false;
let failedQueue: Array<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resolve: (value?: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reject: (reason?: any) => void;
}> = [];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

// Interceptor này sẽ chạy trước mỗi request được gửi đi
axiosClient.interceptors.request.use(
  async (config) => {
    // Lấy token từ AsyncStorage
    const token = await AsyncStorage.getItem('jwt_token');
    
    // Nếu có token, thêm nó vào header Authorization
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      // Log để debug (chỉ trong dev mode)
      if (__DEV__) {
        console.log(`🔐 Request to ${config.url}: Token ${token.substring(0, 20)}...`);
      }
    } else {
      // Log cảnh báo nếu không có token
      if (__DEV__) {
        console.warn(`⚠️ Request to ${config.url}: No token found`);
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor này sẽ chạy khi nhận response hoặc gặp lỗi
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Xử lý lỗi Network Error
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.error('Network Error Details:', {
        url: error.config?.url,
        baseURL: BASE_URL,
        method: error.config?.method,
        message: error.message,
      });
      
      // Tạo error message rõ ràng hơn
      const networkError = new Error('Không thể kết nối đến server. Vui lòng kiểm tra:\n1. Backend đã được khởi động chưa?\n2. IP address có đúng không?\n3. Có cùng mạng Wi-Fi không?');
      networkError.name = 'NetworkError';
      return Promise.reject(networkError);
    }
    
    // Xử lý timeout
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      const timeoutError = new Error('Kết nối quá thời gian. Vui lòng thử lại.');
      timeoutError.name = 'TimeoutError';
      return Promise.reject(timeoutError);
    }
    
    // Xử lý lỗi 401 (Unauthorized) - Token hết hạn hoặc không hợp lệ
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Xóa token cũ ngay lập tức
      await AsyncStorage.multiRemove(['jwt_token', 'refresh_token']);
      
      if (isRefreshing) {
        // Nếu đang refresh token, thêm request vào queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return axiosClient(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = await AsyncStorage.getItem('refresh_token');
      
      if (refreshToken) {
        try {
          // Gọi API refresh token trực tiếp
          const response = await axios.post(`${BASE_URL}/auth/refresh-token`, { 
            refreshToken 
          });
          const newToken = response.data.jwt;
          
          // Lưu token mới
          await AsyncStorage.setItem('jwt_token', newToken);
          
          // Xử lý queue
          processQueue(null, newToken);
          
          // Retry request ban đầu
          originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
          return axiosClient(originalRequest);
          
        } catch (refreshError) {
          // Refresh token cũng bị lỗi, xóa hết token
          await AsyncStorage.multiRemove(['jwt_token', 'refresh_token']);
          
          processQueue(refreshError, null);
          
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        // Không có refresh token, xóa token
        await AsyncStorage.removeItem('jwt_token');
        return Promise.reject(error);
      }
    }
    
    // Xử lý lỗi 403 (Forbidden) - Không có quyền truy cập hoặc token không hợp lệ
    if (error.response?.status === 403 && !originalRequest._retry) {
      console.warn('🚫 403 Forbidden:', {
        url: originalRequest.url,
        method: originalRequest.method,
        hasToken: !!originalRequest.headers['Authorization'],
        responseData: error.response?.data,
      });
      
      // Thử refresh token trước khi báo lỗi
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      const currentToken = await AsyncStorage.getItem('jwt_token');
      
      console.log('🔄 Token status:', {
        hasRefreshToken: !!refreshToken,
        hasCurrentToken: !!currentToken,
        isRefreshing,
      });
      
      if (refreshToken && !isRefreshing) {
        originalRequest._retry = true;
        isRefreshing = true;
        
        try {
          console.log('🔄 Attempting token refresh for 403 error...');
          // Gọi API refresh token
          const response = await axios.post(`${BASE_URL}/auth/refresh-token`, { 
            refreshToken 
          });
          const newToken = response.data.jwt;
          
          console.log('✅ Token refreshed successfully');
          
          // Lưu token mới
          await AsyncStorage.setItem('jwt_token', newToken);
          
          // Retry request ban đầu với token mới
          originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
          return axiosClient(originalRequest);
          
        } catch (refreshError: any) {
          // Refresh token thất bại, có thể là vấn đề về quyền hoặc token đã hết hạn hoàn toàn
          console.error('❌ Token refresh failed for 403 error:', {
            status: refreshError?.response?.status,
            message: refreshError?.message,
            data: refreshError?.response?.data,
          });
          isRefreshing = false;
          
          // Tạo error message rõ ràng hơn
          const forbiddenError = new Error(
            'Bạn không có quyền truy cập tính năng này. Vui lòng đăng nhập lại hoặc liên hệ quản trị viên.'
          );
          forbiddenError.name = 'ForbiddenError';
          return Promise.reject(forbiddenError);
        } finally {
          isRefreshing = false;
        }
      } else {
        // Không có refresh token hoặc đang refresh, báo lỗi quyền truy cập
        console.warn('⚠️ Cannot refresh token for 403 error:', {
          hasRefreshToken: !!refreshToken,
          isRefreshing,
        });
        
        const forbiddenError = new Error(
          'Bạn không có quyền truy cập tính năng này. Vui lòng đăng nhập lại hoặc liên hệ quản trị viên.'
        );
        forbiddenError.name = 'ForbiddenError';
        return Promise.reject(forbiddenError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosClient;

