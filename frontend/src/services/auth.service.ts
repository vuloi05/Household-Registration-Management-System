import apiClient from './api.config';
import { LoginRequest, LoginResponse, User } from '@types/user.types';

class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return apiClient.post('/auth/login', credentials);
  }

  async logout(): Promise<void> {
    return apiClient.post('/auth/logout');
  }

  async getCurrentUser(): Promise<User> {
    return apiClient.get('/auth/me');
  }

  async refreshToken(): Promise<{ accessToken: string }> {
    return apiClient.post('/auth/refresh');
  }

  async changePassword(data: {
    oldPassword: string;
    newPassword: string;
  }): Promise<void> {
    return apiClient.post('/auth/change-password', data);
  }
}

export const authService = new AuthService();