// src/types/hoKhau.ts
import { z } from 'zod';

// 1. Định nghĩa Schema Validation với Zod
export const hoKhauSchema = z.object({
  maHoKhau: z.string().min(1, 'Mã hộ khẩu là bắt buộc'),
  chuHo: z.string().min(1, 'Tên chủ hộ là bắt buộc'),
  diaChi: z.string().min(1, 'Địa chỉ là bắt buộc'),
});

// 2. Suy ra kiểu TypeScript từ Schema
// Kiểu này sẽ được dùng trong các component React
export type HoKhauFormValues = z.infer<typeof hoKhauSchema>;