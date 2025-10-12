// src/api/axiosClient.ts
import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:8080/api', // URL gốc của backend
  headers: {
    'Content-Type': 'application/json',
  },
});

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

export default axiosClient;