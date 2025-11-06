// src/api/authApi.ts
import axiosClient from './axiosClient';

// Kiểu dữ liệu gửi đi
export interface AuthRequest {
  username?: string;
  password?: string;
}

// Kiểu dữ liệu cho mobile login (sử dụng CCCD)
export interface MobileAuthRequest {
  cccd: string;
  password: string;
}

// Kiểu dữ liệu nhận về
export interface AuthResponse {
  jwt: string;
}

// Kiểu dữ liệu cho cặp token
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

// Kiểu dữ liệu cho refresh token request
export interface RefreshTokenRequest {
  refreshToken: string;
}

// Hàm gọi API đăng nhập
export const loginApi = async (data: AuthRequest): Promise<AuthResponse> => {
  const response = await axiosClient.post('/auth/login', data);
  return response.data;
};

// Hàm gọi API đăng nhập với refresh token
export const loginWithRefreshApi = async (data: AuthRequest): Promise<TokenPair> => {
  const response = await axiosClient.post('/auth/login-with-refresh', data);
  return response.data;
};

// Hàm gọi API refresh token
export const refreshTokenApi = async (refreshToken: string): Promise<AuthResponse> => {
  const response = await axiosClient.post('/auth/refresh-token', { refreshToken });
  return response.data;
};

// Hàm gọi API đăng nhập cho mobile app (sử dụng CCCD)
export const mobileLoginApi = async (data: MobileAuthRequest): Promise<TokenPair> => {
  const response = await axiosClient.post('/auth/mobile/login', data);
  return response.data;
};

