// src/types/nhanKhau.ts
import { z } from 'zod';

export const nhanKhauSchema = z.object({
  hoTen: z.string().min(1, 'Họ tên là bắt buộc'),
  biDanh: z.string().optional(),
  ngaySinh: z.string().min(1, 'Ngày sinh là bắt buộc'),
  noiSinh: z.string().optional(),
  queQuan: z.string().optional(),
  danToc: z.string().optional(),
  ngheNghiep: z.string().optional(),
  noiLamViec: z.string().optional(),
  cmndCccd: z.string().optional(),
  ngayCap: z.string().optional(),
  noiCap: z.string().optional(),
  ngayDangKyThuongTru: z.string().optional(),
  diaChiTruocKhiChuyenDen: z.string().optional(),
  quanHeVoiChuHo: z.string().min(1, 'Quan hệ với chủ hộ là bắt buộc'),
});

export type NhanKhauFormValues = z.infer<typeof nhanKhauSchema>;