// src/types/nhanKhau.ts

// Kiểu dữ liệu cho nhân khẩu, có thể mở rộng sau
export interface NhanKhau {
  id: number;
  hoTen: string;
  biDanh?: string;
  ngaySinh: string;
  gioiTinh?: string;
  noiSinh?: string;
  queQuan?: string;
  danToc?: string;
  ngheNghiep?: string;
  noiLamViec?: string;
  cmndCccd: string;
  ngayCap?: string;
  noiCap?: string;
  ngayDangKyThuongTru?: string;
  diaChiTruocKhiChuyenDen?: string;
  quanHeVoiChuHo: string;

  // Thông tin hộ khẩu
  hoKhauId?: number;
  maHoKhau?: string;
  diaChiHoKhau?: string;
}
