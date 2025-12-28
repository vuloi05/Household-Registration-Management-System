// src/api/userApi.ts
import axiosClient from './axiosClient';

// Interface for Change Password request
export interface ChangePasswordRequest {
  oldPassword?: string;
  newPassword?: string;
}

/**
 * API đổi mật khẩu cho người dùng (nhân khẩu) đang đăng nhập.
 * 
 * @param data - Gồm oldPassword và newPassword
 * 
 * TODO: Backend cần implement endpoint này, ví dụ: PUT /api/nhankhau/me/password
 */
export const changeMyPassword = async (data: ChangePasswordRequest): Promise<void> => {
  // The response for a password change is typically 204 No Content, so we don't expect a body
  await axiosClient.put('/nhankhau/me/password', data);
};
