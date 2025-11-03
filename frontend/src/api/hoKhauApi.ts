// src/api/hoKhauApi.ts

import type { HoKhauFormValues } from '../types/hoKhau';
import axiosClient from './axiosClient';
import type { NhanKhau } from './nhanKhauApi'; // Import kiểu NhanKhau

// Cập nhật interface HoKhau ===
// Định nghĩa kiểu dữ liệu HoKhau trả về từ API.
// Nó không còn kế thừa HoKhauFormValues nữa vì cấu trúc đã khác.
export interface HoKhau {
  id: number;
  maHoKhau: string;
  diaChi: string;
  ngayLap: string;
  chuHo: NhanKhau; // Chủ hộ giờ là một object NhanKhau đầy đủ
}

// Hàm gọi API lấy danh sách hộ khẩu (giữ nguyên)
export const getDanhSachHoKhau = async (): Promise<HoKhau[]> => {
  const response = await axiosClient.get('/hokhau');
  return response.data; 
};

// Hàm gọi API tạo hộ khẩu mới
export const createHoKhau = async (data: HoKhauFormValues): Promise<HoKhau> => {
  // Tái cấu trúc lại dữ liệu từ form để khớp với HoKhauRequest DTO của backend
  const payload = {
    hoKhauInfo: {
      maHoKhau: data.maHoKhau,
      diaChi: data.diaChi,
      ngayLap: data.ngayLap,
    },
    chuHoInfo: {
      hoTen: data.chuHoInfo.hoTen,
      ngaySinh: data.chuHoInfo.ngaySinh,
      cmndCccd: data.chuHoInfo.cmndCccd,
      // Có thể thêm các trường khác của chủ hộ ở đây nếu cần
    }
  };
  const response = await axiosClient.post('/hokhau', payload);
  return response.data;
};

// Hàm gọi API cập nhật hộ khẩu
// Lưu ý: hàm này hiện chỉ cập nhật thông tin cơ bản, chưa thay đổi chủ hộ
export const updateHoKhau = async (id: number, data: HoKhauFormValues): Promise<HoKhau> => {
  // Chỉ gửi đi các thông tin cơ bản của hộ khẩu
  const payload = {
    maHoKhau: data.maHoKhau,
    diaChi: data.diaChi,
    ngayLap: data.ngayLap,
  }
  const response = await axiosClient.put(`/hokhau/${id}`, payload);
  return response.data;
};

// Hàm gọi API xóa hộ khẩu (giữ nguyên)
export const deleteHoKhau = async (id: number): Promise<void> => {
  await axiosClient.delete(`/hokhau/${id}`);
};

// Hàm gọi API lấy chi tiết một hộ khẩu (giữ nguyên)
export const getHoKhauById = async (id: number): Promise<HoKhau> => {
  const response = await axiosClient.get(`/hokhau/${id}`);
  return response.data;
};

// Hàm gọi API tách hộ - chuyển nhân khẩu hiện có sang hộ khẩu mới
export const separateHousehold = async (data: HoKhauFormValues, cmndCccd: string): Promise<HoKhau> => {
  const payload = {
    hoKhauInfo: {
      maHoKhau: data.maHoKhau,
      diaChi: data.diaChi,
      ngayLap: data.ngayLap,
    },
    chuHoInfo: {
      hoTen: data.chuHoInfo.hoTen,
      ngaySinh: data.chuHoInfo.ngaySinh,
      cmndCccd: data.chuHoInfo.cmndCccd,
    }
  };
  const response = await axiosClient.post(`/hokhau/separate?cmndCccd=${cmndCccd}`, payload);
  return response.data;
};

// Thêm kiểu dữ liệu cho Lịch sử thay đổi
export interface HoKhauLichSu {
  ngay: string; // Hoặc Date nếu bạn muốn chuyển đổi
  loai: string;
  noiDung: string;
  nguoiGhiNhan: string;
}

// Hàm gọi API lấy lịch sử thay đổi của một hộ khẩu
export const getLichSuThayDoi = async (hoKhauId: number): Promise<HoKhauLichSu[]> => {
  const response = await axiosClient.get(`/hokhau/${hoKhauId}/lich-su-thay-doi`);
  return response.data;
};