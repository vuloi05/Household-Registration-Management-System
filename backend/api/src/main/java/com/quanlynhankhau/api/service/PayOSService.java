package com.quanlynhankhau.api.service;

import com.quanlynhankhau.api.dto.PayOSCreatePaymentRequestDTO;
import com.quanlynhankhau.api.dto.PayOSPaymentResponseDTO;
import com.quanlynhankhau.api.dto.PayOSWebhookDTO;
import com.quanlynhankhau.api.entity.KhoanThu;
import com.quanlynhankhau.api.entity.Payment;
import com.quanlynhankhau.api.entity.PaymentNotification;
import com.quanlynhankhau.api.repository.KhoanThuRepository;
import com.quanlynhankhau.api.repository.PaymentNotificationRepository;
import com.quanlynhankhau.api.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class PayOSService {

    @Value("${payos.client-id:}")
    private String clientId;

    @Value("${payos.api-key:}")
    private String apiKey;

    @Value("${payos.checksum-key:}")
    private String checksumKey;

    @Value("${payos.base-url:https://api-merchant.payos.vn}")
    private String payOSBaseUrl;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private PaymentNotificationRepository paymentNotificationRepository;

    @Autowired
    private KhoanThuRepository khoanThuRepository;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Tạo payment link từ PayOS
     */
    @Transactional
    public PayOSPaymentResponseDTO createPaymentLink(PayOSCreatePaymentRequestDTO request, Long hoKhauId) {
        try {
            // Lấy thông tin khoản thu
            KhoanThu khoanThu = khoanThuRepository.findById(request.getKhoanThuId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy khoản thu với ID: " + request.getKhoanThuId()));

            // Tạo order code (sử dụng timestamp + random để đảm bảo unique)
            int orderCode = (int) (System.currentTimeMillis() / 1000) + new Random().nextInt(1000);

            // Tạo payment ID (UUID)
            String paymentId = UUID.randomUUID().toString();

            // Tạo request body cho PayOS
            int amount = request.getAmount().intValue();
            // Yêu cầu: Nội dung chuyển khoản chỉ hiển thị mã (ví dụ: CSEV8709487).
            // PayOS tự động ghép "mã giao dịch + description" để tạo nội dung chuyển khoản.
            // Để nội dung chỉ có mã, ta đặt description rỗng.
            String description = "";
            
            // PayOS chỉ cho phép description tối đa 25 ký tự
            // Cắt ngắn description nếu quá dài
            if (description.length() > 25) {
                description = description.substring(0, 25);
                System.out.println("⚠️ Description quá dài, đã cắt ngắn xuống 25 ký tự: " + description);
            }
            
            String returnUrl = request.getReturnUrl();
            String cancelUrl = request.getCancelUrl();
            
            // Tạo signature theo format PayOS yêu cầu
            // Data string: amount=$amount&cancelUrl=$cancelUrl&description=$description&orderCode=$orderCode&returnUrl=$returnUrl
            String dataString = String.format("amount=%d&cancelUrl=%s&description=%s&orderCode=%d&returnUrl=%s",
                    amount, cancelUrl, description, orderCode, returnUrl);
            
            // Kiểm tra checksumKey
            if (checksumKey == null || checksumKey.isEmpty()) {
                throw new RuntimeException("PayOS checksum key chưa được cấu hình. Vui lòng kiểm tra PAYOS_CHECKSUM_KEY trong environment variables.");
            }
            
            // Tính HMAC SHA256 signature
            String signature = calculateHMACSHA256(dataString, checksumKey);
            
            System.out.println("🔐 Signature calculation:");
            System.out.println("   Data string: " + dataString);
            System.out.println("   Signature: " + signature.substring(0, Math.min(20, signature.length())) + "...");
            
            Map<String, Object> payOSRequest = new HashMap<>();
            payOSRequest.put("orderCode", orderCode);
            payOSRequest.put("amount", amount);
            payOSRequest.put("description", description);
            payOSRequest.put("returnUrl", returnUrl);
            payOSRequest.put("cancelUrl", cancelUrl);
            payOSRequest.put("signature", signature);
            payOSRequest.put("items", Arrays.asList(
                    Map.of(
                            "name", khoanThu.getTenKhoanThu(),
                            "quantity", 1,
                            "price", amount
                    )
            ));

            // Gọi PayOS API
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-client-id", clientId);
            headers.set("x-api-key", apiKey);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payOSRequest, headers);

            // Log request details
            System.out.println("🌐 Calling PayOS API: " + payOSBaseUrl + "/v2/payment-requests");
            System.out.println("   Client ID: " + (clientId != null && !clientId.isEmpty() ? clientId.substring(0, Math.min(10, clientId.length())) + "..." : "NOT SET"));
            System.out.println("   API Key: " + (apiKey != null && !apiKey.isEmpty() ? apiKey.substring(0, Math.min(10, apiKey.length())) + "..." : "NOT SET"));
            System.out.println("   Request body: " + payOSRequest);

            ResponseEntity<Map<String, Object>> response;
            try {
                response = restTemplate.exchange(
                        payOSBaseUrl + "/v2/payment-requests",
                        HttpMethod.POST,
                        entity,
                        new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {}
                );
            } catch (org.springframework.web.client.ResourceAccessException e) {
                // Network error (DNS, connection, etc.)
                System.err.println("❌ Network error calling PayOS API: " + e.getMessage());
                System.err.println("   URL: " + payOSBaseUrl + "/v2/payment-requests");
                System.err.println("   Cause: " + (e.getCause() != null ? e.getCause().getMessage() : "Unknown"));
                if (e.getCause() instanceof java.net.UnknownHostException) {
                    throw new RuntimeException("Không thể kết nối đến PayOS API. URL có thể không đúng hoặc không có kết nối mạng. URL: " + payOSBaseUrl + ". Vui lòng kiểm tra lại URL trong application.properties hoặc kết nối mạng.", e);
                }
                throw new RuntimeException("Lỗi kết nối đến PayOS API: " + e.getMessage(), e);
            } catch (org.springframework.web.client.HttpClientErrorException e) {
                // HTTP 4xx errors
                System.err.println("❌ PayOS API HTTP error: " + e.getStatusCode());
                System.err.println("   Response body: " + e.getResponseBodyAsString());
                throw new RuntimeException("Lỗi từ PayOS API: " + e.getStatusCode() + " - " + e.getResponseBodyAsString());
            } catch (org.springframework.web.client.HttpServerErrorException e) {
                // HTTP 5xx errors
                System.err.println("❌ PayOS API server error: " + e.getStatusCode());
                System.err.println("   Response body: " + e.getResponseBodyAsString());
                throw new RuntimeException("Lỗi server PayOS: " + e.getStatusCode() + " - " + e.getResponseBodyAsString());
            }

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> responseBody = response.getBody();
                System.out.println("✅ PayOS API Response: " + responseBody);
                
                // PayOS trả về format: {code: "00", desc: "Success", data: {...}}
                String code = (String) responseBody.get("code");
                String desc = (String) responseBody.get("desc");
                
                if (code == null || !code.equals("00")) {
                    // PayOS trả về lỗi
                    System.err.println("❌ PayOS API returned error:");
                    System.err.println("   Code: " + code);
                    System.err.println("   Desc: " + desc);
                    System.err.println("   Full response: " + responseBody);
                    throw new RuntimeException("PayOS API lỗi: " + desc + " (code: " + code + ")");
                }
                
                // Lấy data object
                @SuppressWarnings("unchecked")
                Map<String, Object> data = (Map<String, Object>) responseBody.get("data");
                
                if (data == null) {
                    System.err.println("❌ PayOS API response missing data object!");
                    System.err.println("   Full response: " + responseBody);
                    throw new RuntimeException("PayOS API không trả về data. Response: " + responseBody);
                }
                
                String checkoutUrl = (String) data.get("checkoutUrl");
                String qrCode = (String) data.get("qrCode");
                
                System.out.println("   checkoutUrl: " + (checkoutUrl != null ? checkoutUrl.substring(0, Math.min(50, checkoutUrl.length())) + "..." : "NULL"));
                System.out.println("   qrCode: " + (qrCode != null ? qrCode.substring(0, Math.min(50, qrCode.length())) + "..." : "NULL"));
                
                if (checkoutUrl == null || checkoutUrl.isEmpty()) {
                    System.err.println("❌ PayOS API response missing checkoutUrl!");
                    System.err.println("   Full response: " + responseBody);
                    throw new RuntimeException("PayOS API không trả về checkoutUrl. Response: " + responseBody);
                }
                
                if (qrCode == null || qrCode.isEmpty()) {
                    System.err.println("⚠️ PayOS API response missing qrCode!");
                }

                // Lưu payment vào database
                Payment payment = new Payment();
                payment.setPaymentId(paymentId);
                payment.setKhoanThuId(request.getKhoanThuId());
                payment.setHoKhauId(hoKhauId);
                payment.setAmount(request.getAmount());
                payment.setStatus("PENDING");
                payment.setQrCodeString(qrCode);
                payment.setTransactionId(String.valueOf(orderCode));
                payment.setCreatedAt(LocalDateTime.now());
                paymentRepository.save(payment);

                PayOSPaymentResponseDTO responseDTO = new PayOSPaymentResponseDTO();
                responseDTO.setPaymentId(paymentId);
                responseDTO.setCheckoutUrl(checkoutUrl);
                responseDTO.setQrCode(qrCode);
                return responseDTO;
            } else {
                System.err.println("❌ PayOS API returned status: " + response.getStatusCode());
                System.err.println("   Response body: " + response.getBody());
                throw new RuntimeException("Không thể tạo payment link từ PayOS. Status: " + response.getStatusCode());
            }
        } catch (RuntimeException e) {
            // Re-throw RuntimeException as-is
            throw e;
        } catch (Exception e) {
            System.err.println("❌ Unexpected error calling PayOS API: " + e.getClass().getName());
            System.err.println("   Message: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Lỗi khi tạo payment link: " + e.getMessage(), e);
        }
    }

    /**
     * Xử lý webhook từ PayOS
     */
    @Transactional
    public void handleWebhook(PayOSWebhookDTO webhookDTO, String signature) {
        try {
            // Verify checksum nếu có signature
            if (signature != null && !signature.isEmpty()) {
                if (!verifyChecksum(webhookDTO, signature)) {
                    System.err.println("⚠️ Checksum verification failed");
                    throw new RuntimeException("Checksum verification failed");
                }
            } else {
                System.out.println("⚠️ No signature provided, skipping checksum verification");
            }

            if (webhookDTO.getData() == null) {
                return;
            }

            String orderCode = webhookDTO.getData().getOrderCode();
            String code = webhookDTO.getData().getCode();

            // Tìm payment theo transactionId (orderCode)
            Payment payment = paymentRepository.findAll().stream()
                    .filter(p -> p.getTransactionId() != null && p.getTransactionId().equals(String.valueOf(orderCode)))
                    .findFirst()
                    .orElse(null);

            if (payment == null) {
                return;
            }

            // Cập nhật trạng thái payment
            if ("00".equals(code)) {
                // Payment thành công
                payment.setStatus("PAID");
                payment.setPaidAt(LocalDateTime.now());
                payment.setPayerName(webhookDTO.getData().getAccountName());
                payment.setPayerAccount(webhookDTO.getData().getAccountNumber());
                paymentRepository.save(payment);

                // Tạo notification
                createPaymentNotification(payment);
            } else {
                // Payment thất bại hoặc bị hủy
                payment.setStatus("CANCELLED");
                paymentRepository.save(payment);
            }
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi xử lý webhook: " + e.getMessage(), e);
        }
    }

    /**
     * Tính HMAC SHA256 signature cho PayOS request
     */
    private String calculateHMACSHA256(String data, String key) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return bytesToHex(hash);
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            System.err.println("❌ Error calculating HMAC SHA256: " + e.getMessage());
            throw new RuntimeException("Error calculating signature: " + e.getMessage(), e);
        }
    }

    /**
     * Verify checksum từ PayOS webhook
     * PayOS gửi checksum trong header x-payos-signature
     */
    private boolean verifyChecksum(PayOSWebhookDTO webhookDTO, String signature) {
        try {
            if (webhookDTO.getData() == null || signature == null || signature.isEmpty()) {
                return false;
            }

            // Tạo data string để verify theo format của PayOS
            // Format: orderCode|amount|description|accountNumber|transactionDateTime
            String dataString = String.format("%s|%s|%s|%s|%s",
                    webhookDTO.getData().getOrderCode() != null ? webhookDTO.getData().getOrderCode() : "",
                    webhookDTO.getData().getAmount() != null ? webhookDTO.getData().getAmount().toString() : "",
                    webhookDTO.getData().getDescription() != null ? webhookDTO.getData().getDescription() : "",
                    webhookDTO.getData().getAccountNumber() != null ? webhookDTO.getData().getAccountNumber() : "",
                    webhookDTO.getData().getTransactionDateTime() != null ? webhookDTO.getData().getTransactionDateTime() : "");

            // Tính HMAC SHA256
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(checksumKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] hash = mac.doFinal(dataString.getBytes(StandardCharsets.UTF_8));
            String calculatedChecksum = bytesToHex(hash);

            // So sánh với signature từ header (case-insensitive)
            boolean isValid = calculatedChecksum.equalsIgnoreCase(signature);
            
            if (!isValid) {
                System.err.println("⚠️ Checksum mismatch:");
                System.err.println("   Calculated: " + calculatedChecksum);
                System.err.println("   Received:   " + signature);
                System.err.println("   Data:       " + dataString);
            }
            
            return isValid;
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            System.err.println("❌ Error verifying checksum: " + e.getMessage());
            return false;
        }
    }

    /**
     * Tạo payment notification
     */
    private void createPaymentNotification(Payment payment) {
        KhoanThu khoanThu = khoanThuRepository.findById(payment.getKhoanThuId())
                .orElse(null);

        if (khoanThu == null) {
            return;
        }

        PaymentNotification notification = new PaymentNotification();
        notification.setNotificationId(UUID.randomUUID().toString());
        notification.setPaymentId(payment.getPaymentId());
        notification.setKhoanThuId(payment.getKhoanThuId());
        notification.setKhoanThuTen(khoanThu.getTenKhoanThu());
        notification.setHoKhauId(payment.getHoKhauId());
        notification.setHoKhauTen(""); // Có thể lấy từ hoKhau service nếu cần
        notification.setNguoiThanhToan(payment.getPayerName() != null ? payment.getPayerName() : "");
        notification.setSoTien(payment.getAmount());
        notification.setNgayThanhToan(payment.getPaidAt());
        notification.setDaXem(false);
        notification.setCreatedAt(LocalDateTime.now());

        paymentNotificationRepository.save(notification);
    }

    /**
     * Convert bytes to hex string
     */
    private String bytesToHex(byte[] bytes) {
        StringBuilder result = new StringBuilder();
        for (byte b : bytes) {
            result.append(String.format("%02x", b));
        }
        return result.toString();
    }
}
