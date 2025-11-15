package com.quanlynhankhau.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PayOSWebhookDTO {
    private String code;
    private String desc;
    private PayOSWebhookDataDTO data;
}

