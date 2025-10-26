// src/types/nhanKhau.ts
import { z } from 'zod';

// Schema cơ bản không có validation mã hộ khẩu
export const nhanKhauSchema = z.object({
  hoTen: z.string().min(1, 'Họ tên là bắt buộc'),
  biDanh: z.string().optional(),
  ngaySinh: z.string().min(1, 'Ngày sinh là bắt buộc'),
  gioiTinh: z.string().optional(),
  noiSinh: z.string().optional(),
  queQuan: z.string().optional(),
  danToc: z.string().optional(),
  ngheNghiep: z.string().optional(),
  noiLamViec: z.string().optional(),
  cmndCccd: z.string().min(1, 'Số CMND/CCCD là bắt buộc'),
  ngayCap: z.string().min(1, 'Ngày cấp là bắt buộc'),
  noiCap: z.string().min(1, 'Nơi cấp là bắt buộc'),
  ngayDangKyThuongTru: z.string().optional(),
  diaChiTruocKhiChuyenDen: z.string().optional(),
  quanHeVoiChuHo: z.string().min(1, 'Quan hệ với chủ hộ là bắt buộc'),
  maHoKhau: z.string().optional(),
});

// Schema với validation mã hộ khẩu bắt buộc
export const nhanKhauWithMaHoKhauSchema = nhanKhauSchema.extend({
  maHoKhau: z.string().min(1, 'Mã hộ khẩu là bắt buộc'),
});

export type NhanKhauFormValues = z.infer<typeof nhanKhauSchema>;
export type NhanKhauWithMaHoKhauFormValues = z.infer<typeof nhanKhauWithMaHoKhauSchema>;