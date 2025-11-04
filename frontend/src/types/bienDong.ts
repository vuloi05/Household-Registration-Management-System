// src/types/bienDong.ts

import { z } from 'zod';

export const bienDongNhanKhauSchema = z.object({
  nhanKhauId: z.number(),
  loaiBienDong: z.string().nonempty("Loại biến động là bắt buộc"),
  ngayBienDong: z.string().nonempty("Ngày biến động là bắt buộc"),
  noiChuyenDen: z.string().optional(),
  lyDo: z.string().optional(),
  ghiChu: z.string().optional(),
});

export type BienDongNhanKhauFormValues = z.infer<typeof bienDongNhanKhauSchema>;

export interface BienDongNhanKhauDTO {
  id: number;
  nhanKhauId: number;
  hoTenNhanKhau: string;
  cmndCccd: string;
  maHoKhau: string;
  loaiBienDong: string;
  ngayBienDong: string;
  noiChuyenDen?: string;
  lyDo?: string;
  ghiChu?: string;
  nguoiGhiNhan?: string;
}
