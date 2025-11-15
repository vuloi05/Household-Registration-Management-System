package com.quanlynhankhau.api.controller;

import com.quanlynhankhau.api.dto.*;
import com.quanlynhankhau.api.entity.NhanKhau;
import com.quanlynhankhau.api.entity.User;
import com.quanlynhankhau.api.repository.NhanKhauRepository;
import com.quanlynhankhau.api.repository.UserRepository;
import com.quanlynhankhau.api.service.PaymentService;
import com.quanlynhankhau.api.service.PayOSService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private PayOSService payOSService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NhanKhauRepository nhanKhauRepository;

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

    /**
     * Tạo payment link từ PayOS
     */
    @PostMapping("/create")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTANT', 'RESIDENT')")
    public ResponseEntity<PayOSPaymentResponseDTO> createPayment(@RequestBody PayOSCreatePaymentRequestDTO request) {
        // Lấy user hiện tại
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        // Log để debug
        System.out.println("🔐 Payment create request - Authentication: " + (authentication != null ? "Authenticated" : "Not authenticated"));
        if (authentication != null) {
            System.out.println("   Principal: " + authentication.getPrincipal().getClass().getName());
            System.out.println("   Authorities: " + authentication.getAuthorities());
        }
        
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String username = userDetails.getUsername();
        System.out.println("   Username: " + username);

        // Tìm user
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (!userOpt.isPresent()) {
            throw new RuntimeException("Không tìm thấy user");
        }

        User user = userOpt.get();
        Long hoKhauId = null;

        // Nếu là RESIDENT, lấy hoKhauId từ NhanKhau
        if ("ROLE_RESIDENT".equals(user.getRole())) {
            Optional<NhanKhau> nhanKhauOpt = nhanKhauRepository.findByCmndCccd(username);
            if (nhanKhauOpt.isPresent() && nhanKhauOpt.get().getHoKhau() != null) {
                hoKhauId = nhanKhauOpt.get().getHoKhau().getId();
            }
        }

        PayOSPaymentResponseDTO response = payOSService.createPaymentLink(request, hoKhauId);
        return ResponseEntity.ok(response);
    }

    /**
     * Webhook từ PayOS
     */
    @PostMapping("/webhook")
    public ResponseEntity<?> handleWebhook(
            @RequestBody PayOSWebhookDTO webhookDTO,
            @RequestHeader(value = "x-payos-signature", required = false) String signature,
            @RequestHeader(value = "X-PayOS-Signature", required = false) String signatureAlt) {
        // PayOS có thể gửi signature với tên header khác nhau, kiểm tra cả hai
        String finalSignature = signature != null ? signature : signatureAlt;
        try {
            // Log webhook received
            System.out.println("📥 PayOS Webhook received: " + webhookDTO.getCode() + " - " + webhookDTO.getDesc());
            if (webhookDTO.getData() != null) {
                System.out.println("   Order Code: " + webhookDTO.getData().getOrderCode());
                System.out.println("   Amount: " + webhookDTO.getData().getAmount());
            }
            
            payOSService.handleWebhook(webhookDTO, finalSignature);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            System.err.println("❌ Error processing webhook: " + e.getMessage());
            e.printStackTrace();
            // Trả về 200 để PayOS không retry (hoặc 500 nếu muốn PayOS retry)
            return ResponseEntity.status(200).body("Error: " + e.getMessage());
        }
    }

    /**
     * Lấy trạng thái payment
     */
    @GetMapping("/status/{paymentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTANT', 'RESIDENT')")
    public ResponseEntity<PaymentStatusDTO> getPaymentStatus(@PathVariable String paymentId) {
        PaymentStatusDTO status = paymentService.getPaymentStatus(paymentId);
        return ResponseEntity.ok(status);
    }
}

