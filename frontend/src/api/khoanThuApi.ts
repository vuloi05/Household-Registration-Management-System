// src/api/khoanThuApi.ts
import axiosClient from './axiosClient';
import type { LichSuNopTien } from './nopTienApi';


// Kiểu dữ liệu KHOẢN THU mà API trả về
export interface KhoanThu {
  id: number;
  tenKhoanThu: string;
  ngayTao: string;
  loaiKhoanThu: 'BAT_BUOC' | 'DONG_GOP';
  soTienTrenMotNhanKhau?: number | null;
}

// Kiểu dữ liệu cho thống kê
export interface ThongKeKhoanThu {
    soHoDaNop: number;
    tongSoHo: number;
    tongSoTien: number;
}

// Kiểu dữ liệu cho FORM
export interface KhoanThuFormValues {
    tenKhoanThu: string;
    loaiKhoanThu: 'BAT_BUOC' | 'DONG_GOP';
    soTienTrenMotNhanKhau?: number | null;
}

// Hàm API lấy danh sách
export const getDanhSachKhoanThu = async (): Promise<KhoanThu[]> => {
  const response = await axiosClient.get('/khoanthu');
  return response.data;
};

// Hàm API tạo mới
export const createKhoanThu = async (data: KhoanThuFormValues): Promise<KhoanThu> => {
  const response = await axiosClient.post('/khoanthu', data);
  return response.data;
};

/**
 * Hàm gọi API cập nhật một khoản thu đã có.
 * @param id ID của khoản thu cần cập nhật.
 * @param data Dữ liệu mới của khoản thu.
 * @returns Khoản thu sau khi đã được cập nhật.
 */
export const updateKhoanThu = async (id: number, data: KhoanThuFormValues): Promise<KhoanThu> => {
  const response = await axiosClient.put(`/khoanthu/${id}`, data);
  return response.data;
};

/**
 * Hàm gọi API xóa một khoản thu.
 * @param id ID của khoản thu cần xóa.
 */
export const deleteKhoanThu = async (id: number): Promise<void> => {
  await axiosClient.delete(`/khoanthu/${id}`);
};


export const getKhoanThuById = async (id: number): Promise<KhoanThu> => {
  const response = await axiosClient.get(`/khoanthu/${id}`);
  return response.data;
};

// Hàm lấy lịch sử nộp tiền của một khoản thu
export const getLichSuNopTienByKhoanThuId = async (id: number): Promise<LichSuNopTien[]> => {
    const response = await axiosClient.get(`/khoanthu/${id}/lichsu`);
    return response.data;
};

// Hàm lấy thống kê của một khoản thu
export const getThongKeKhoanThu = async (id: number): Promise<ThongKeKhoanThu> => {
    const response = await axiosClient.get(`/khoanthu/${id}/thongke`);
    return response.data;
};