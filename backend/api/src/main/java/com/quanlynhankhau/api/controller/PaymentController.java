package com.quanlynhankhau.api.controller;

import com.quanlynhankhau.api.dto.*;
import com.quanlynhankhau.api.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    /**
     * Tạo payment request
     */
    @PostMapping("/vietqr/create")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTANT', 'RESIDENT')")
    public ResponseEntity<?> createPaymentRequest(
            @RequestBody PaymentRequestDTO request,
            Authentication authentication) {
        try {
            // Lấy hoKhauId từ request hoặc từ user context
            // Nếu request có hoKhauId thì dùng, nếu không thì để null
            // (Có thể implement logic lấy từ user context sau)
            Long hoKhauId = request.getHoKhauId();
            
            PaymentResponseDTO response = paymentService.createPaymentRequest(request, hoKhauId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Kiểm tra trạng thái payment
     */
    @GetMapping("/vietqr/status/{paymentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTANT', 'RESIDENT')")
    public ResponseEntity<?> checkPaymentStatus(@PathVariable String paymentId) {
        try {
            PaymentStatusDTO status = paymentService.getPaymentStatus(paymentId);
            return ResponseEntity.ok(status);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    /**
     * Webhook nhận thông báo từ Casso/payOS hoặc service khác
     * Lưu ý: VietQR.io không có webhook, cần tích hợp với Casso/payOS
     * Endpoint này không cần authentication vì được gọi từ service bên thứ 3
     */
    @PostMapping("/vietqr/webhook")
    public ResponseEntity<?> handleWebhook(@RequestBody VietQRWebhookDTO webhook) {
        try {
            paymentService.handlePaymentWebhook(webhook);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            // Log lỗi nhưng vẫn trả về 200 để service không retry
            System.err.println("Webhook error: " + e.getMessage());
            return ResponseEntity.ok().build();
        }
    }

    /**
     * Lấy danh sách notifications
     */
    @GetMapping("/notifications")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTANT')")
    public ResponseEntity<List<PaymentNotificationDTO>> getNotifications() {
        List<PaymentNotificationDTO> notifications = paymentService.getNotifications();
        return ResponseEntity.ok(notifications);
    }

    /**
     * Đánh dấu notification đã đọc
     */
    @PutMapping("/notifications/{id}/read")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTANT')")
    public ResponseEntity<?> markAsRead(@PathVariable String id) {
        paymentService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    /**
     * Đánh dấu tất cả đã đọc
     */
    @PutMapping("/notifications/read-all")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTANT')")
    public ResponseEntity<?> markAllAsRead() {
        paymentService.markAllAsRead();
        return ResponseEntity.ok().build();
    }

    /**
     * Lấy số lượng chưa đọc
     */
    @GetMapping("/notifications/unread-count")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTANT')")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        long count = paymentService.getUnreadCount();
        Map<String, Long> response = new HashMap<>();
        response.put("count", count);
        return ResponseEntity.ok(response);
    }
}

