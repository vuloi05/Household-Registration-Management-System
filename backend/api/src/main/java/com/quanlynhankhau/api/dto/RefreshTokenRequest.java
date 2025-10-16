// src/main/java/com/quanlynhankhau/api/dto/RefreshTokenRequest.java
package com.quanlynhankhau.api.dto;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class RefreshTokenRequest {
    private String refreshToken;

    public RefreshTokenRequest() {}

    public RefreshTokenRequest(String refreshToken) {
        this.refreshToken = refreshToken;
    }

}
