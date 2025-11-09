// src/main/java/com/quanlynhankhau/api/controller/AuthController.java
package com.quanlynhankhau.api.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

import com.quanlynhankhau.api.dto.AuthRequest;
import com.quanlynhankhau.api.dto.AuthResponse;
import com.quanlynhankhau.api.dto.MobileAuthRequest;
import com.quanlynhankhau.api.dto.RefreshTokenRequest;
import com.quanlynhankhau.api.service.AuthService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5173", "*"})  // Cho phép CORS từ mobile app
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> createAuthenticationToken(@RequestBody AuthRequest authRequest) throws Exception {
        final String jwt = authService.authenticate(authRequest);
        return ResponseEntity.ok(new AuthResponse(jwt));
    }
    
    @PostMapping("/login-with-refresh")
    public ResponseEntity<?> createAuthenticationTokenWithRefresh(@RequestBody AuthRequest authRequest) throws Exception {
        Map<String, String> tokens = authService.authenticateWithRefreshToken(authRequest);
        return ResponseEntity.ok(tokens);
    }
    
    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(@RequestBody RefreshTokenRequest refreshTokenRequest) {
        try {
            String newAccessToken = authService.refreshToken(refreshTokenRequest.getRefreshToken());
            return ResponseEntity.ok(new AuthResponse(newAccessToken));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Endpoint đăng nhập cho mobile app
     * Chỉ cho phép nhân khẩu đăng nhập bằng số CCCD
     * Admin và kế toán không thể đăng nhập qua mobile app
     */
    @PostMapping("/mobile/login")
    public ResponseEntity<?> mobileLogin(@RequestBody MobileAuthRequest mobileAuthRequest) {
        try {
            Map<String, String> tokens = authService.authenticateMobile(mobileAuthRequest);
            return ResponseEntity.ok(tokens);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Endpoint tạm thời để mã hóa mật khẩu.
     * Sau khi lấy được chuỗi hash, bạn có thể xóa endpoint này đi.
     */
    @GetMapping("/encode/{password}")
    public ResponseEntity<String> encodePassword(@PathVariable String password) {
        return ResponseEntity.ok(passwordEncoder.encode(password));
    }
}