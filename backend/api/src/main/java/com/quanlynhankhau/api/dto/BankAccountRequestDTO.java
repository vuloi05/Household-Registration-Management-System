package com.quanlynhankhau.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BankAccountRequestDTO {
    private String accountNumber;
    private String accountName;
    private String bankName;
    private String bankCode;
    private String branchName;
    private Boolean isDefault;
}

