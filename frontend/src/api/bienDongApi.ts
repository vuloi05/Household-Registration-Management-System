// src/api/bienDongApi.ts

import axiosClient from './axiosClient';
import type { BienDongNhanKhauFormValues, BienDongNhanKhauDTO } from '../types/bienDong';

export const getAllBienDong = async (): Promise<BienDongNhanKhauDTO[]> => {
  const response = await axiosClient.get('/bien-dong');
  return response.data;
};

export const ghiNhanBienDong = (data: BienDongNhanKhauFormValues) => {
  return axiosClient.post('/bien-dong/nhan-khau', data);
};

export const getLichSuByHoKhauId = (hoKhauId: number) => {
  return axiosClient.get(`/bien-dong/ho-khau/${hoKhauId}`);
};
