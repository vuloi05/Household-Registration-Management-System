// src/api/axiosClient.ts
import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const axiosClient = axios.create({
  baseURL: baseURL, // URL gốc của backend
  headers: {
    'Content-Type': 'application/json',
  },
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
  (config) => {
    // Lấy token từ localStorage
    const token = localStorage.getItem('jwt_token');
    
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
    
    // Nếu lỗi 401 và không phải từ refresh token endpoint
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Xóa token cũ ngay lập tức
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('refresh_token');
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

      const refreshToken = localStorage.getItem('refresh_token');
      
      if (refreshToken) {
        try {
          // Gọi API refresh token trực tiếp để tránh circular import
          const response = await axios.post(`${baseURL}/auth/refresh-token`, { 
            refreshToken 
          });
          const newToken = response.data.jwt;
          
          // Lưu token mới
          localStorage.setItem('jwt_token', newToken);
          
          // Xử lý queue
          processQueue(null, newToken);
          
          // Retry request ban đầu
          originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
          return axiosClient(originalRequest);
          
        } catch (refreshError) {
          // Refresh token cũng bị lỗi, xóa hết token và redirect về login
          localStorage.removeItem('jwt_token');
          localStorage.removeItem('refresh_token');
          
          processQueue(refreshError, null);
          
          // Redirect về trang login
          window.location.href = '/login';
          
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        // Không có refresh token, redirect về login
        localStorage.removeItem('jwt_token');
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosClient;