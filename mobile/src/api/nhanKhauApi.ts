// src/api/nhanKhauApi.ts
import type { AxiosError } from 'axios';
import axiosClient from './axiosClient';
import type { NhanKhau } from '../types/nhanKhau';
import type { HoKhau } from '../types/hoKhau';

// This type can be expanded with more editable fields
export interface NhanKhauFormValues {
  ngheNghiep?: string;
  noiLamViec?: string;
}

/**
 * Lấy thông tin chi tiết của nhân khẩu hiện tại.
 * Dữ liệu được lấy dựa trên token đăng nhập.
 */
export const getMyNhanKhau = async (): Promise<NhanKhau> => {
  const response = await axiosClient.get('/nhankhau/me');
  return response.data;
};

/**
 * Cập nhật thông tin chi tiết của nhân khẩu hiện tại.
 *
 * TODO: Backend cần implement endpoint này, ví dụ: PUT /api/nhankhau/me
 * @param data - Các trường có thể chỉnh sửa của nhân khẩu.
 */
export const updateMyNhanKhau = async (data: NhanKhauFormValues): Promise<NhanKhau> => {
    const response = await axiosClient.put('/nhankhau/me', data);
    return response.data;
};

/**
 * Lấy thông tin hộ khẩu của nhân khẩu hiện tại.
 */
export const getMyHoKhau = async (): Promise<HoKhau> => {
  const response = await axiosClient.get('/nhankhau/me/hokhau');
  return response.data;
};

/**
 * Tìm kiếm nhân khẩu theo số CCCD.
 * Trả về null nếu không tìm thấy.
 */
export const searchNhanKhauByCccd = async (cccd: string): Promise<NhanKhau | null> => {
  try {
    const response = await axiosClient.get(`/nhankhau/search?cmndCccd=${cccd}`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 404) {
      return null;
    }
    throw error;
  }
};
