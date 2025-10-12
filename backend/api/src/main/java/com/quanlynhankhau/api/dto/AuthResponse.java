// src/main/java/com/quanlynhankhau/api/dto/AuthResponse.java
package com.quanlynhankhau.api.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor // Tạo constructor với tham số
public class AuthResponse {
    private final String jwt;
}