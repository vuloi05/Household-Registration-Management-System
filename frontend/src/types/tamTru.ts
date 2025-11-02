// src/types/tamTru.ts

import { z } from 'zod';

export const tamTruSchema = z.object({
  hoTen: z.string().nonempty(),
  ngaySinh: z.string().optional(),
  gioiTinh: z.string().optional(),
  cmndCccd: z.string().optional(),
  noiThuongTru: z.string().optional(),
  hoKhauTiepNhanId: z.number(),
  ngayBatDau: z.string().nonempty(),
  ngayKetThuc: z.string().nonempty(),
  lyDo: z.string().optional(),
});

export type TamTru = z.infer<typeof tamTruSchema> & { id: number };
export type TamTruFormValues = z.infer<typeof tamTruSchema>;
