export interface HoKhau {
  id: number;
  maHoKhau: string;
  diaChi: string;
  ngayLap: string;
  chuHo: NhanKhau;
}

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
  hoKhauId?: number;
  maHoKhau?: string;
  diaChiHoKhau?: string;
}

export interface AuthRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  jwt: string;
}

