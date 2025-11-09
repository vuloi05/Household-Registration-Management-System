package com.quanlynhankhau.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentStatusDTO {
    private String id;
    private String status; // pending, paid, expired, cancelled
    private BigDecimal amount;
    private LocalDateTime createdAt;
    private LocalDateTime paidAt;
}

