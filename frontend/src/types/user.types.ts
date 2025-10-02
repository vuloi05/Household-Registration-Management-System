import { BaseEntity } from './common.types';

export enum UserRole {
  ADMIN = 'ADMIN',
  LEADER = 'LEADER', // Tổ trưởng
  DEPUTY_LEADER = 'DEPUTY_LEADER', // Tổ phó
  ACCOUNTANT = 'ACCOUNTANT', // Kế toán
  STAFF = 'STAFF' // Cán bộ
}

export interface User extends BaseEntity {
  username: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  isActive: boolean;
  lastLogin?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}