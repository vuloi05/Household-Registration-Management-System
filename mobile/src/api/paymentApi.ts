// src/api/paymentApi.ts
import axiosClient from './axiosClient';

// Interface cho Payment Request
export interface PaymentRequest {
  khoanThuId: number;
  nhanKhauId?: number;
  amount: number;
  description?: string;
  returnUrl?: string;
  cancelUrl?: string;
}

// Interface cho Payment Response
export interface PaymentResponse {
  paymentId: string;
  checkoutUrl: string;
  qrCode: string;
}

// Interface cho Payment Status
export interface PaymentStatus {
  id: string;
  status: 'pending' | 'paid' | 'expired' | 'cancelled';
  amount: number;
  createdAt: string;
  paidAt?: string;
}

/**
 * Tạo payment link từ PayOS
 */
export const createPayment = async (request: PaymentRequest): Promise<PaymentResponse> => {
  const response = await axiosClient.post('/payment/create', request);
  return response.data;
};

/**
 * Lấy trạng thái payment
 */
export const getPaymentStatus = async (paymentId: string): Promise<PaymentStatus> => {
  const response = await axiosClient.get(`/payment/status/${paymentId}`);
  return response.data;
};

