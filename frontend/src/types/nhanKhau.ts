// src/types/nhanKhau.ts
import { z } from 'zod';

export const nhanKhauSchema = z.object({
  hoTen: z.string().min(1, 'Họ tên là bắt buộc'),
  ngaySinh: z.string().min(1, 'Ngày sinh là bắt buộc'), // Tạm thời là string, sẽ dùng Date Picker sau
  cmndCccd: z.string().optional(), // CCCD có thể có hoặc không
  quanHeVoiChuHo: z.string().min(1, 'Quan hệ với chủ hộ là bắt buộc'),
  // Thêm các trường khác nếu bạn muốn có trong form
  queQuan: z.string().optional(),
  danToc: z.string().optional(),
  ngheNghiep: z.string().optional(),
});

export type NhanKhauFormValues = z.infer<typeof nhanKhauSchema>;