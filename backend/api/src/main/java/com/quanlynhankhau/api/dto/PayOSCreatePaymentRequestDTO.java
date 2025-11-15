package com.quanlynhankhau.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PayOSCreatePaymentRequestDTO {
    private Long khoanThuId;
    private BigDecimal amount;
    private String description;
    private String returnUrl;
    private String cancelUrl;
}
