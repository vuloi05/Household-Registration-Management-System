package com.quanlynhankhau.api.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment_notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentNotification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String notificationId; // UUID

    private String paymentId;

    private Long khoanThuId;

    private String khoanThuTen;

    private Long hoKhauId;

    private String hoKhauTen;

    private String nguoiThanhToan;

    private BigDecimal soTien;

    private LocalDateTime ngayThanhToan;

    private Boolean daXem = false;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (daXem == null) {
            daXem = false;
        }
    }
}

