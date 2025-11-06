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
    
    // Nếu lỗi 401 và không phải từ refresh token endpoint
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Xóa token cũ ngay lập tức
      await AsyncStorage.multiRemove(['jwt_token', 'refresh_token']);
    }
    
    // Nếu lỗi 401 và chưa retry
    if (error.response?.status === 401 && !originalRequest._retry) {
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
    
    return Promise.reject(error);
  }
);

export default axiosClient;

