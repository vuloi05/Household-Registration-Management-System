// src/api/userApi.ts
import axiosClient from './axiosClient';

// Interface for User
export interface User {
  id?: number;
  username: string;
  password?: string;
  fullName: string;
  role: 'ROLE_ADMIN' | 'ROLE_ACCOUNTANT';
}

// Interface for API response with pagination
export interface UserPageResponse {
  content: User[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// Get all users with pagination
export const getAllUsers = async (
  page: number = 0,
  size: number = 10,
  search?: string
): Promise<UserPageResponse> => {
  const params: Record<string, number | string> = { page, size };
  if (search) {
    params.search = search;
  }
  const response = await axiosClient.get('/users', { params });
  return response.data;
};

// Get user by ID
export const getUserById = async (id: number): Promise<User> => {
  const response = await axiosClient.get(`/users/${id}`);
  return response.data;
};

// Create new user
export const createUser = async (user: User): Promise<User> => {
  const response = await axiosClient.post('/users', user);
  return response.data;
};

// Update existing user
export const updateUser = async (id: number, user: User): Promise<User> => {
  const response = await axiosClient.put(`/users/${id}`, user);
  return response.data;
};

// Delete user
export const deleteUser = async (id: number): Promise<void> => {
  await axiosClient.delete(`/users/${id}`);
};
