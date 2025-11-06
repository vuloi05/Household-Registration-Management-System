package com.quanlynhankhau.api.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MobileAuthRequest {
    private String cccd;  // Số CCCD thay vì username
    private String password;
}




