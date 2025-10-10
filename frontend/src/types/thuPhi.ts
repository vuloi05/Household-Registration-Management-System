// src/types/thuPhi.ts
import { z } from 'zod';

// Schema validation cho form thu phí
export const thuPhiSchema = z.object({
  tenPhi: z.string().min(1, 'Tên phí là bắt buộc'),
  moTa: z.string().min(1, 'Mô tả là bắt buộc'),
  soTien: z.number().min(0, 'Số tiền phải lớn hơn hoặc bằng 0'),
  ngayThu: z.string().min(1, 'Ngày thu là bắt buộc'),
  loaiPhi: z.enum(['DIEN', 'NUOC', 'QUAN_LY', 'KHAC'], {
    message: 'Loại phí là bắt buộc',
  }),
  trangThai: z.enum(['CHUA_THU', 'DA_THU', 'QUA_HAN'], {
    message: 'Trạng thái là bắt buộc',
  }),
});

// Types
export type ThuPhiFormValues = z.infer<typeof thuPhiSchema>;

export interface ThuPhi extends ThuPhiFormValues {
  id: number;
  ngayTao: string;
  ngayCapNhat: string;
}

// Enum cho các loại phí
export const LoaiPhi = {
  DIEN: 'Tiền điện',
  NUOC: 'Tiền nước', 
  QUAN_LY: 'Phí quản lý',
  KHAC: 'Khác',
} as const;

// Enum cho trạng thái
export const TrangThaiPhi = {
  CHUA_THU: 'Chưa thu',
  DA_THU: 'Đã thu',
  QUA_HAN: 'Quá hạn',
} as const;