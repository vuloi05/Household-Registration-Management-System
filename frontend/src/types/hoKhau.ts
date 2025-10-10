// src/types/hoKhau.ts
import { z } from 'zod';

// Schema cho thông tin của Chủ hộ (là một Nhân khẩu)
const chuHoSchema = z.object({
  hoTen: z.string().min(1, 'Họ tên chủ hộ là bắt buộc'),
  ngaySinh: z.string().min(1, 'Ngày sinh là bắt buộc'),
  cmndCccd: z.string().min(9, 'CCCD phải có ít nhất 9 ký tự').max(12, 'CCCD không quá 12 ký tự'),
});

// Schema chính cho toàn bộ Form
export const hoKhauSchema = z.object({
  // Thông tin Hộ khẩu
  maHoKhau: z.string().min(1, 'Mã hộ khẩu là bắt buộc'),
  diaChi: z.string().min(1, 'Địa chỉ là bắt buộc'),
  ngayLap: z.string().min(1, 'Ngày lập là bắt buộc'),
  
  // Thông tin Chủ hộ được lồng vào
  chuHoInfo: chuHoSchema,
});

// Suy ra kiểu TypeScript từ Schema chính
export type HoKhauFormValues = z.infer<typeof hoKhauSchema>;