// src/api/thuPhiApi.ts
import axiosClient from './axiosClient';
import type { ThuPhi, ThuPhiFormValues } from '../types/thuPhi';

// Lấy danh sách tất cả các khoản thu phí
export const getDanhSachThuPhi = async (): Promise<ThuPhi[]> => {
  const response = await axiosClient.get('/thu-phi');
  return response.data;
};

// Tạo mới một khoản thu phí
export const createThuPhi = async (data: ThuPhiFormValues): Promise<ThuPhi> => {
  const response = await axiosClient.post('/thu-phi', data);
  return response.data;
};

// Cập nhật thông tin khoản thu phí
export const updateThuPhi = async (id: number, data: ThuPhiFormValues): Promise<ThuPhi> => {
  const response = await axiosClient.put(`/thu-phi/${id}`, data);
  return response.data;
};

// Xóa khoản thu phí
export const deleteThuPhi = async (id: number): Promise<void> => {
  await axiosClient.delete(`/thu-phi/${id}`);
};

// Lấy thông tin chi tiết của một khoản thu phí
export const getThuPhiById = async (id: number): Promise<ThuPhi> => {
  const response = await axiosClient.get(`/thu-phi/${id}`);
  return response.data;
};

// Export type để sử dụng ở các nơi khác
export type { ThuPhi } from '../types/thuPhi';