package com.quanlynhankhau.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentNotificationDTO {
    private String id;
    private String paymentId;
    private Long khoanThuId;
    private String khoanThuTen;
    private Long hoKhauId;
    private String hoKhauTen;
    private String nguoiThanhToan;
    private BigDecimal soTien;
    private LocalDateTime ngayThanhToan;
    private Boolean daXem;
}

