// src/api/authApi.ts
import axiosClient from './axiosClient';

// Kiểu dữ liệu gửi đi
export interface AuthRequest {
  username?: string;
  password?: string;
}

// Kiểu dữ liệu nhận về
export interface AuthResponse {
  jwt: string;
}

// Hàm gọi API đăng nhập
export const loginApi = async (data: AuthRequest): Promise<AuthResponse> => {
  const response = await axiosClient.post('/auth/login', data);
  return response.data;
};