// src/types/nopTien.ts
import { z } from 'zod';
import type { HoKhau } from '../api/hoKhauApi';

export const nopTienSchema = z.object({
 // hoKhau giờ là một object, không phải là number
  hoKhau: z.custom<HoKhau>(
    (val) => val != null && typeof (val as any).id === 'number', 
    { message: 'Vui lòng chọn một hộ khẩu' }
  ),

  ngayNop: z.string().min(1, 'Ngày nộp là bắt buộc'),
  
  // Xử lý trường số: không cho phép null hoặc undefined
  soTien: z.number().positive('Số tiền phải là số dương'),

  nguoiThu: z.string().min(1, 'Tên người thu là bắt buộc'),
});

// Suy ra kiểu TypeScript để dùng trong form
export type NopTienInput = z.infer<typeof nopTienSchema>;