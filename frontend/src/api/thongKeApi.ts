// src/api/thongKeApi.ts
import axiosClient from './axiosClient';

// Kiểu dữ liệu cho thống kê tổng quan
export interface ThongKeTongQuan {
  soHoKhau: number;
  soNhanKhau: number;
  soTamTru: number;
}

// Kiểu dữ liệu cho thống kê độ tuổi (Map<string, number>)
export type ThongKeDoTuoi = Record<string, number>;

// API lấy thống kê tổng quan
export const getThongKeTongQuan = async (): Promise<ThongKeTongQuan> => {
  const response = await axiosClient.get('/thongke/tongquan');
  return response.data;
};

// API lấy thống kê theo độ tuổi
export const getThongKeDoTuoi = async (): Promise<ThongKeDoTuoi> => {
    const response = await axiosClient.get('/thongke/dotuoi');
    return response.data;
};