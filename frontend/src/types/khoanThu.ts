// src/types/khoanThu.ts
import { z } from 'zod';

export const khoanThuSchema = z.object({
  tenKhoanThu: z.string().min(1, { message: 'Tên khoản thu là bắt buộc' }),
  loaiKhoanThu: z.enum(['BAT_BUOC', 'DONG_GOP']),
  soTienTrenMotNhanKhau: z.number().positive().optional().nullable(),
}).refine(data => {
    if (data.loaiKhoanThu === 'BAT_BUOC') {
        return data.soTienTrenMotNhanKhau != null && data.soTienTrenMotNhanKhau > 0;
    }
    return true;
}, {
    message: 'Số tiền trên mỗi nhân khẩu là bắt buộc',
    path: ['soTienTrenMotNhanKhau'],
});