package com.quanlynhankhau.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PayOSPaymentResponseDTO {
    private String paymentId;
    private String checkoutUrl;
    private String qrCode;
}

