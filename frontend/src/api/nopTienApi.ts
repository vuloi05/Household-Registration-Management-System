// src/api/nopTienApi.ts
import axiosClient from './axiosClient';

// Kiểu dữ liệu mà Form sẽ gửi đi (khớp với NopTienRequestDTO)
export interface NopTienFormValues {
  hoKhauId: number;
  khoanThuId: number;
  ngayNop: string;
  soTien: number;
  nguoiThu: string;
}

// Kiểu dữ liệu mà API trả về (khớp với LichSuNopTien Entity)
export interface LichSuNopTien {
  id: number;
  ngayNop: string;
  soTien: number;
  nguoiThu: string;
  // API không trả về hoKhau và khoanThu chi tiết, nên chúng ta không cần định nghĩa ở đây
}

// Hàm gọi API ghi nhận nộp tiền
export const ghiNhanNopTien = async (data: NopTienFormValues): Promise<LichSuNopTien> => {
  const response = await axiosClient.post('/noptien', data);
  return response.data;
};