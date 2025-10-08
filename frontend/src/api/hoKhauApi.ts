// src/api/hoKhauApi.ts

import type { HoKhauFormValues } from '../types/hoKhau';
import axiosClient from './axiosClient';

// Định nghĩa kiểu dữ liệu trả về từ API (có thêm id)
export interface HoKhau extends HoKhauFormValues {
  id: number;
}

// Hàm gọi API lấy danh sách hộ khẩu
// --- SỬA LỖI Ở ĐÂY: Đảm bảo có từ khóa `async` ---
export const getDanhSachHoKhau = async (): Promise<HoKhau[]> => {
  const response = await axiosClient.get('/hokhau');
  return response.data; 
};

// Hàm gọi API tạo hộ khẩu mới
// --- SỬA LỖI Ở ĐÂY: Đảm bảo có từ khóa `async` ---
export const createHoKhau = async (data: HoKhauFormValues): Promise<HoKhau> => {
  const response = await axiosClient.post('/hokhau', data);
  return response.data;
};

// Hàm gọi API cập nhật hộ khẩu
export const updateHoKhau = async (id: number, data: HoKhauFormValues): Promise<HoKhau> => {
  const response = await axiosClient.put(`/hokhau/${id}`, data);
  return response.data;
};

// Hàm gọi API xóa hộ khẩu
export const deleteHoKhau = async (id: number): Promise<void> => {
  await axiosClient.delete(`/hokhau/${id}`);
};

// Hàm gọi API lấy chi tiết một hộ khẩu
export const getHoKhauById = async (id: number): Promise<HoKhau> => {
  const response = await axiosClient.get(`/hokhau/${id}`);
  return response.data;
};