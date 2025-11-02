// src/api/bienDongApi.ts

import axiosClient from './axiosClient';
import type { BienDongNhanKhauFormValues } from '../types/bienDong';

export const ghiNhanBienDong = (data: BienDongNhanKhauFormValues) => {
  return axiosClient.post('/bien-dong/nhan-khau', data);
};

export const getLichSuByHoKhauId = (hoKhauId: number) => {
  return axiosClient.get(`/bien-dong/ho-khau/${hoKhauId}`);
};
