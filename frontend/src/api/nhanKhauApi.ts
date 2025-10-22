// src/api/nhanKhauApi.ts
import type { NhanKhauFormValues } from '../types/nhanKhau';
import axiosClient from './axiosClient';

// Kiểu dữ liệu cho nhân khẩu, có thể mở rộng sau
export interface NhanKhau extends Partial<NhanKhauFormValues> {
  id: number;
  hoTen: string;
  ngaySinh: string;
  cmndCccd: string;
  quanHeVoiChuHo: string;
  // ... các trường khác
}

// Hàm gọi API lấy danh sách nhân khẩu của một hộ
export const getDanhSachNhanKhau = async (hoKhauId: number): Promise<NhanKhau[]> => {
  const response = await axiosClient.get(`/hokhau/${hoKhauId}/nhankhau`);
  return response.data;
};

// Hàm gọi API tạo nhân khẩu mới cho một hộ
export const createNhanKhau = async (hoKhauId: number, data: NhanKhauFormValues): Promise<NhanKhau> => {
    const response = await axiosClient.post(`/hokhau/${hoKhauId}/nhankhau`, data);
    return response.data;
};

// Hàm gọi API cập nhật nhân khẩu
export const updateNhanKhau = async (hoKhauId: number, nhanKhauId: number, data: NhanKhauFormValues): Promise<NhanKhau> => {
    const response = await axiosClient.put(`/hokhau/${hoKhauId}/nhankhau/${nhanKhauId}`, data);
    return response.data;
};

// Hàm gọi API xóa nhân khẩu
export const deleteNhanKhau = async (hoKhauId: number, nhanKhauId: number): Promise<void> => {
    await axiosClient.delete(`/hokhau/${hoKhauId}/nhankhau/${nhanKhauId}`);
};

// Hàm gọi API tìm kiếm nhân khẩu theo số CCCD
export const searchNhanKhauByCmndCccd = async (cmndCccd: string): Promise<NhanKhau | null> => {
    try {
        const response = await axiosClient.get(`/nhankhau/search?cmndCccd=${cmndCccd}`);
        return response.data;
    } catch (error) {
        // Nếu không tìm thấy (404), trả về null
        if (error.response?.status === 404) {
            return null;
        }
        throw error;
    }
};