package com.quanlynhankhau.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequestDTO {
    private Long khoanThuId;
    private BigDecimal amount;
    private String accountNo;
    private String accountName;
    private String addInfo;
    private Long hoKhauId; // Optional: có thể lấy từ user context hoặc truyền từ request
}

