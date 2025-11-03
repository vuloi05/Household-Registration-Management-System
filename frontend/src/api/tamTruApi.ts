// src/api/tamTruApi.ts

import axiosClient from './axiosClient';
import type { TamTru } from '../types/tamTru';

export const getAllTamTru = () => {
  return axiosClient.get<TamTru[]>('/tam-vang-tam-tru/tam-tru');
};

export const createTamTru = (data: Partial<TamTru>) => {
  return axiosClient.post<TamTru>('/tam-vang-tam-tru/tam-tru', data);
};
