package com.quanlynhankhau.api.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String paymentId; // UUID

    private Long khoanThuId;

    private Long hoKhauId; // Lưu hoKhauId từ user đang đăng nhập

    private BigDecimal amount;

    private String status; // PENDING, PAID, EXPIRED, CANCELLED

    @Column(columnDefinition = "TEXT")
    private String qrCodeString;

    private LocalDateTime createdAt;

    private LocalDateTime paidAt;

    private String transactionId;

    private String payerName;

    private String payerAccount;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}

