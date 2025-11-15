package com.quanlynhankhau.api.service;

import com.quanlynhankhau.api.dto.*;
import com.quanlynhankhau.api.entity.*;
import com.quanlynhankhau.api.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private PaymentNotificationRepository paymentNotificationRepository;

    /**
     * Lấy trạng thái payment
     */
    public PaymentStatusDTO getPaymentStatus(String paymentId) {
        Payment payment = paymentRepository.findByPaymentId(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found: " + paymentId));

        PaymentStatusDTO dto = new PaymentStatusDTO();
        dto.setId(payment.getPaymentId());
        dto.setStatus(payment.getStatus().toLowerCase());
        dto.setAmount(payment.getAmount());
        dto.setCreatedAt(payment.getCreatedAt());
        dto.setPaidAt(payment.getPaidAt());
        return dto;
    }

    /**
     * Lấy danh sách notifications
     */
    public List<PaymentNotificationDTO> getNotifications() {
        return paymentNotificationRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::convertToNotificationDTO)
                .collect(Collectors.toList());
    }

    /**
     * Đánh dấu notification đã đọc
     */
    @Transactional
    public void markAsRead(String notificationId) {
        PaymentNotification notification = paymentNotificationRepository.findAll().stream()
                .filter(n -> n.getNotificationId().equals(notificationId))
                .findFirst()
                .orElse(null);

        if (notification != null) {
            notification.setDaXem(true);
            paymentNotificationRepository.save(notification);
        }
    }

    /**
     * Đánh dấu tất cả đã đọc
     */
    @Transactional
    public void markAllAsRead() {
        paymentNotificationRepository.markAllAsRead();
    }

    /**
     * Lấy số lượng chưa đọc
     */
    public long getUnreadCount() {
        return paymentNotificationRepository.countByDaXemFalse();
    }

    private PaymentNotificationDTO convertToNotificationDTO(PaymentNotification notification) {
        PaymentNotificationDTO dto = new PaymentNotificationDTO();
        dto.setId(notification.getNotificationId());
        dto.setPaymentId(notification.getPaymentId());
        dto.setKhoanThuId(notification.getKhoanThuId());
        dto.setKhoanThuTen(notification.getKhoanThuTen());
        dto.setHoKhauId(notification.getHoKhauId());
        dto.setHoKhauTen(notification.getHoKhauTen());
        dto.setNguoiThanhToan(notification.getNguoiThanhToan());
        dto.setSoTien(notification.getSoTien());
        dto.setNgayThanhToan(notification.getNgayThanhToan());
        dto.setDaXem(notification.getDaXem());
        return dto;
    }
}

