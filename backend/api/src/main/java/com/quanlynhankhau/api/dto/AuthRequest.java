// src/main/java/com/quanlynhankhau/api/dto/AuthRequest.java
package com.quanlynhankhau.api.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AuthRequest {
    private String username;
    private String password;
}