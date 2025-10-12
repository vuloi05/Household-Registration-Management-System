// src/main/java/com/quanlynhankhau/api/controller/AuthController.java
package com.quanlynhankhau.api.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.quanlynhankhau.api.dto.AuthRequest;
import com.quanlynhankhau.api.dto.AuthResponse;
import com.quanlynhankhau.api.service.AuthService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
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

    /**
     * Endpoint tạm thời để mã hóa mật khẩu.
     * Sau khi lấy được chuỗi hash, bạn có thể xóa endpoint này đi.
     */
    @GetMapping("/encode/{password}")
    public ResponseEntity<String> encodePassword(@PathVariable String password) {
        return ResponseEntity.ok(passwordEncoder.encode(password));
    }
}