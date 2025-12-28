// src/types/hoKhau.ts
import type { NhanKhau } from './nhanKhau';

// Định nghĩa kiểu dữ liệu HoKhau trả về từ API.
export interface HoKhau {
  id: number;
  maHoKhau: string;
  diaChi: string;
  ngayLap: string;
  chuHo: NhanKhau; // Chủ hộ là một object NhanKhau đầy đủ
  thanhVien: NhanKhau[]; // Danh sách thành viên
}
