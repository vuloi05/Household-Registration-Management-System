package com.quanlynhankhau.api.service;

import com.quanlynhankhau.api.dto.*;
import com.quanlynhankhau.api.entity.*;
import com.quanlynhankhau.api.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private PaymentNotificationRepository paymentNotificationRepository;

    @Autowired
    private KhoanThuRepository khoanThuRepository;

    @Autowired
    private HoKhauRepository hoKhauRepository;

    @Autowired
    private LichSuNopTienService lichSuNopTienService;

    // VietQR Quick Link không cần API key
    // Nếu muốn dùng API v2/generate, cần đăng ký tại my.vietqr.io
    @Value("${vietqr.client.id:}")
    private String vietqrClientId;

    @Value("${vietqr.api.key:}")
    private String vietqrApiKey;

    @Value("${payment.receiver.account.no}")
    private String receiverAccountNo;

    @Value("${payment.receiver.account.name}")
    private String receiverAccountName;
    
    @Value("${payment.receiver.bank.id:vietcombank}")
    private String receiverBankId;
    
    @Value("${payment.receiver.bank.bin:970436}")
    private String receiverBankBin;
    
    @Value("${payment.receiver.template.id:compact2}")
    private String templateId;

    /**
     * Tạo payment request và tạo QR code bằng VietQR Quick Link
     * Lưu ý: VietQR.io không có webhook, cần tích hợp với Casso/payOS để tự động xác nhận
     */
    @Transactional
    public PaymentResponseDTO createPaymentRequest(PaymentRequestDTO request, Long hoKhauId) {
        try {
            // Tạo payment entity
            Payment payment = new Payment();
            payment.setPaymentId(UUID.randomUUID().toString());
            payment.setKhoanThuId(request.getKhoanThuId());
            payment.setHoKhauId(hoKhauId);
            payment.setAmount(request.getAmount());
            payment.setStatus("PENDING");
            payment.setCreatedAt(LocalDateTime.now());

            // Sử dụng VietQR Quick Link (không cần API key)
            // Format: https://api.vietqr.io/image/<BANK_BIN>-<ACCOUNT_NO>-<TEMPLATE>.jpg?amount=<AMOUNT>&addInfo=<DESCRIPTION>&accountName=<ACCOUNT_NAME>
            // Ví dụ: https://api.vietqr.io/image/970436-1050566308-NrjAkzZ.jpg?accountName=TRAN%20VAN%20MANH&amount=50000&addInfo=thu%20phi%20tu%20dong
            String accountNo = request.getAccountNo() != null ? request.getAccountNo() : receiverAccountNo;
            String accountName = request.getAccountName() != null ? request.getAccountName() : receiverAccountName;
            String addInfo = request.getAddInfo() != null ? request.getAddInfo() : "Thanh toan khoan thu " + request.getKhoanThuId();
            
            // Lấy mã BIN từ số tài khoản (6 số đầu) hoặc từ config
            // Nếu số tài khoản không có mã BIN ở đầu, dùng bank ID từ config để lấy mã BIN
            String bankBin = getBankBinFromAccountNo(accountNo);
            
            // Template ID - có thể dùng template mặc định hoặc template custom từ my.vietqr.io
            // Nếu có template ID trong config, dùng nó, nếu không dùng "compact2"
            String templateId = getTemplateId();
            
            // Tạo Quick Link URL
            // Format: https://api.vietqr.io/image/{BANK_BIN}-{ACCOUNT_NO}-{TEMPLATE_ID}.jpg?amount={AMOUNT}&addInfo={DESCRIPTION}&accountName={ACCOUNT_NAME}
            String qrCodeUrl = String.format(
                "https://api.vietqr.io/image/%s-%s-%s.jpg?amount=%d&addInfo=%s&accountName=%s",
                bankBin,
                accountNo,
                templateId,
                request.getAmount().intValue(),
                java.net.URLEncoder.encode(addInfo, "UTF-8"),
                java.net.URLEncoder.encode(accountName, "UTF-8")
            );
            
            // Lưu QR code URL vào payment
            payment.setQrCodeString(qrCodeUrl);
            payment = paymentRepository.save(payment);

            PaymentResponseDTO responseDTO = new PaymentResponseDTO();
            responseDTO.setPaymentId(payment.getPaymentId());
            responseDTO.setQrCodeUrl(qrCodeUrl);
            responseDTO.setQrCodeString(qrCodeUrl); // Dùng URL làm string để hiển thị QR
            return responseDTO;
        } catch (Exception e) {
            throw new RuntimeException("Error creating payment request: " + e.getMessage(), e);
        }
    }
    
    /**
     * Lấy mã BIN từ số tài khoản
     * Có 2 cách:
     * 1. Nếu số tài khoản bắt đầu bằng mã BIN (6 số đầu như 970415, 970436...)
     * 2. Nếu không, dùng mã BIN từ config (PAYMENT_RECEIVER_BANK_BIN)
     */
    private String getBankBinFromAccountNo(String accountNo) {
        if (accountNo == null || accountNo.length() < 6) {
            return receiverBankBin; // Dùng từ config
        }
        
        String prefix = accountNo.substring(0, 6);
        // Kiểm tra xem 6 số đầu có phải là mã BIN không (bắt đầu bằng 970)
        if (prefix.startsWith("970")) {
            return prefix; // Trả về mã BIN (6 số đầu)
        }
        
        // Nếu không có mã BIN ở đầu, dùng từ config
        return receiverBankBin;
    }
    
    /**
     * Lấy template ID từ config
     * Có thể dùng template mặc định (compact2) hoặc template custom từ my.vietqr.io
     */
    private String getTemplateId() {
        return templateId;
    }

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
     * Xử lý webhook từ VietQR
     */
    @Transactional
    public void handlePaymentWebhook(VietQRWebhookDTO webhook) {
        Payment payment = paymentRepository.findByPaymentId(webhook.getPaymentId())
                .orElse(null);

        if (payment == null) {
            return; // Payment không tồn tại, bỏ qua
        }

        // Kiểm tra nếu đã được xử lý rồi (idempotency)
        if ("PAID".equals(payment.getStatus())) {
            return; // Đã xử lý rồi, bỏ qua
        }

        if ("paid".equalsIgnoreCase(webhook.getStatus())) {
            // Cập nhật payment
            payment.setStatus("PAID");
            payment.setPaidAt(webhook.getPaidAt() != null ? webhook.getPaidAt() : LocalDateTime.now());
            payment.setTransactionId(webhook.getTransactionId());
            payment.setPayerName(webhook.getPayerName());
            payment.setPayerAccount(webhook.getPayerAccount());
            paymentRepository.save(payment);

            // Lấy thông tin khoản thu và hộ khẩu
            KhoanThu khoanThu = khoanThuRepository.findById(payment.getKhoanThuId()).orElse(null);
            HoKhau hoKhau = payment.getHoKhauId() != null 
                    ? hoKhauRepository.findById(payment.getHoKhauId()).orElse(null) 
                    : null;

            // Tạo notification
            PaymentNotification notification = new PaymentNotification();
            notification.setNotificationId(UUID.randomUUID().toString());
            notification.setPaymentId(payment.getPaymentId());
            notification.setKhoanThuId(payment.getKhoanThuId());
            notification.setKhoanThuTen(khoanThu != null ? khoanThu.getTenKhoanThu() : "Khoản thu #" + payment.getKhoanThuId());
            notification.setHoKhauId(payment.getHoKhauId());
            notification.setHoKhauTen(hoKhau != null ? hoKhau.getMaHoKhau() + " - " + hoKhau.getDiaChi() : "Hộ khẩu #" + payment.getHoKhauId());
            notification.setNguoiThanhToan(webhook.getPayerName() != null ? webhook.getPayerName() : "Người dùng");
            notification.setSoTien(payment.getAmount());
            notification.setNgayThanhToan(payment.getPaidAt());
            notification.setDaXem(false);
            paymentNotificationRepository.save(notification);

            // Tự động ghi nhận nộp tiền
            if (payment.getHoKhauId() != null && payment.getKhoanThuId() != null) {
                try {
                    NopTienRequestDTO nopTienRequest = new NopTienRequestDTO();
                    nopTienRequest.setHoKhauId(payment.getHoKhauId());
                    nopTienRequest.setKhoanThuId(payment.getKhoanThuId());
                    nopTienRequest.setNgayNop(LocalDate.now());
                    nopTienRequest.setSoTien(payment.getAmount());
                    nopTienRequest.setNguoiThu("Hệ thống tự động");
                    lichSuNopTienService.ghiNhanNopTien(nopTienRequest);
                } catch (Exception e) {
                    // Log lỗi nhưng không throw để không ảnh hưởng đến webhook
                    System.err.println("Error auto-recording payment: " + e.getMessage());
                }
            }
        } else if ("expired".equalsIgnoreCase(webhook.getStatus()) || "cancelled".equalsIgnoreCase(webhook.getStatus())) {
            payment.setStatus(webhook.getStatus().toUpperCase());
            paymentRepository.save(payment);
        }
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

