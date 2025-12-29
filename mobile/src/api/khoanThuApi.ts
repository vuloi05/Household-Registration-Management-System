// src/api/khoanThuApi.ts
import axiosClient from './axiosClient';

// Kiểu dữ liệu cho trạng thái thanh toán
export type PaymentStatusState = 'DA_NOP' | 'CHUA_NOP';

// Kiểu dữ liệu KHOẢN THU mà API trả về
export interface KhoanThu {
  id: number;
  tenKhoanThu: string;
  ngayTao: string;
  loaiKhoanThu: 'BAT_BUOC' | 'DONG_GOP';
  soTienTrenMotNhanKhau?: number | null;
  trangThaiThanhToan?: PaymentStatusState;
}

// Hàm API lấy danh sách (cho ADMIN và ACCOUNTANT)
export const getDanhSachKhoanThu = async (): Promise<KhoanThu[]> => {
  const response = await axiosClient.get('/khoanthu');
  return response.data;
};

// Hàm API lấy danh sách công khai (cho RESIDENT, ADMIN, ACCOUNTANT)
export const getDanhSachKhoanThuPublic = async (): Promise<KhoanThu[]> => {
  const response = await axiosClient.get('/khoanthu/public');
  return response.data;
};

// Hàm lấy khoản thu theo ID
export const getKhoanThuById = async (id: number): Promise<KhoanThu> => {
  const response = await axiosClient.get(`/khoanthu/${id}`);
  return response.data;
};

