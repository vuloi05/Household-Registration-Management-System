// src/api/hoKhauApi.ts
import axiosClient from './axiosClient';
import type { HoKhau } from '../types/hoKhau';
import type { NhanKhau } from '../types/nhanKhau';

/**
 * Lấy chi tiết một hộ khẩu bằng ID
 */
export const getHoKhauById = async (id: number): Promise<HoKhau> => {
  const response = await axiosClient.get(`/hokhau/${id}`);
  return response.data;
};

/**
 * Lấy danh sách tất cả nhân khẩu thuộc về một hộ khẩu
 */
export const getNhanKhauByHoKhauId = async (hoKhauId: number): Promise<NhanKhau[]> => {
  const response = await axiosClient.get(`/hokhau/${hoKhauId}/nhankhau`);
  return response.data;
};
