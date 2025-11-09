// src/api/vietqrApi.ts
import axios from 'axios';
import axiosClient from './axiosClient';

// Cấu hình VietQR API
// Lưu ý: Cần đăng ký tài khoản tại https://vietqr.io để lấy Client ID và API Key
const VIETQR_API_BASE_URL = 'https://api.vietqr.io/v2';
const VIETQR_CLIENT_ID = process.env.EXPO_PUBLIC_VIETQR_CLIENT_ID || '';
const VIETQR_API_KEY = process.env.EXPO_PUBLIC_VIETQR_API_KEY || '';

// Interface cho Payment Request
export interface VietQRPaymentRequest {
  accountNo: string; // Số tài khoản nhận tiền
  accountName: string; // Tên chủ tài khoản
  acqId?: number; // Mã ngân hàng (tùy chọn)
  amount: number; // Số tiền
  addInfo?: string; // Nội dung thanh toán
  template?: string; // Template QR (compact hoặc compact2)
}

// Interface cho Payment Response từ VietQR
export interface VietQRPaymentResponse {
  code: string;
  desc: string;
  data: {
    qrCode: string; // URL hoặc base64 của QR code
    qrDataURL: string; // Data URL của QR code để hiển thị
  };
}

// Interface cho Payment Status
export interface PaymentStatus {
  id: string;
  status: 'pending' | 'paid' | 'expired' | 'cancelled';
  amount: number;
  createdAt: string;
  paidAt?: string;
}

// Tạo payment request qua backend (để bảo mật API key)
// Backend sẽ tự lấy thông tin tài khoản từ config
// accountNo và accountName là optional - nếu không truyền, backend sẽ dùng từ config
export const createPaymentRequest = async (
  khoanThuId: number,
  amount: number,
  accountNo?: string,
  accountName?: string,
  addInfo?: string
): Promise<{ paymentId: string; qrCodeUrl?: string; qrDataURL?: string; qrCodeString?: string }> => {
  const requestBody: any = {
    khoanThuId,
    amount,
    addInfo: addInfo || `Thanh toan khoan thu ${khoanThuId}`,
  };
  
  // Chỉ thêm accountNo và accountName nếu được truyền vào
  if (accountNo) {
    requestBody.accountNo = accountNo;
  }
  if (accountName) {
    requestBody.accountName = accountName;
  }
  
  const response = await axiosClient.post('/payment/vietqr/create', requestBody);
  return response.data;
};

// Kiểm tra trạng thái thanh toán
export const checkPaymentStatus = async (
  paymentId: string
): Promise<PaymentStatus> => {
  const response = await axiosClient.get(`/payment/vietqr/status/${paymentId}`);
  return response.data;
};

// Lấy danh sách thanh toán của user hiện tại
export const getMyPayments = async (): Promise<PaymentStatus[]> => {
  const response = await axiosClient.get('/payment/vietqr/my-payments');
  return response.data;
};

