// src/api/tamVangApi.ts

import axiosClient from './axiosClient';
import type { TamVang } from '../types/tamVang';

export const getAllTamVang = () => {
  return axiosClient.get<TamVang[]>('/tam-vang-tam-tru/tam-vang');
};

export const createTamVang = (data: Partial<TamVang>) => {
  return axiosClient.post<TamVang>('/tam-vang-tam-tru/tam-vang', data);
};
