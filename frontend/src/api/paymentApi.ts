// src/api/paymentApi.ts
import axiosClient from './axiosClient';

// Interface cho Payment Notification
export interface PaymentNotification {
  id: string;
  paymentId: string;
  khoanThuId: number;
  khoanThuTen: string;
  hoKhauId: number;
  hoKhauTen: string;
  nguoiThanhToan: string;
  soTien: number;
  ngayThanhToan: string;
  daXem: boolean;
}

// Lấy danh sách thông báo thanh toán mới
export const getPaymentNotifications = async (): Promise<PaymentNotification[]> => {
  const response = await axiosClient.get('/payment/notifications');
  return response.data;
};

// Đánh dấu thông báo đã xem
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  await axiosClient.put(`/payment/notifications/${notificationId}/read`);
};

// Đánh dấu tất cả thông báo đã xem
export const markAllNotificationsAsRead = async (): Promise<void> => {
  await axiosClient.put('/payment/notifications/read-all');
};

// Lấy số lượng thông báo chưa đọc
export const getUnreadNotificationCount = async (): Promise<number> => {
  const response = await axiosClient.get('/payment/notifications/unread-count');
  return response.data.count;
};

