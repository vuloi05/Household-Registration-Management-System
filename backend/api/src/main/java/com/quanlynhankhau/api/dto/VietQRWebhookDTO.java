package com.quanlynhankhau.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VietQRWebhookDTO {
    private String paymentId;
    private String status; // paid, expired, cancelled
    private String amount;
    private String transactionId;
    private LocalDateTime paidAt;
    private String payerName;
    private String payerAccount;
}

