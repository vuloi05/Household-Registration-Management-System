// src/api/bienDongApi.ts

import axiosClient from './axiosClient';
import type { BienDongNhanKhauFormValues, BienDongNhanKhauDTO } from '../types/bienDong';

export const getAllBienDong = (): Promise<BienDongNhanKhauDTO[]> => {
  return axiosClient.get('/bien-dong');
};

export const ghiNhanBienDong = (data: BienDongNhanKhauFormValues) => {
  return axiosClient.post('/bien-dong/nhan-khau', data);
};

export const getLichSuByHoKhauId = (hoKhauId: number) => {
  return axiosClient.get(`/bien-dong/ho-khau/${hoKhauId}`);
};
