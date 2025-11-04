// src/types/tamVang.ts

import { z } from 'zod';

export const tamVangSchema = z.object({
  nhanKhauId: z.number(),
  nhanKhauHoTen: z.string().optional(),
  ngayBatDau: z.string().nonempty(),
  ngayKetThuc: z.string().nonempty(),
  noiDen: z.string().optional(),
  lyDo: z.string().optional(),
});

export type TamVang = z.infer<typeof tamVangSchema> & { id: number };
export type TamVangFormValues = z.infer<typeof tamVangSchema>;
