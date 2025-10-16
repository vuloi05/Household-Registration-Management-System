// src/main/java/com/quanlynhankhau/api/service/AuthService.java
package com.quanlynhankhau.api.service;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import com.quanlynhankhau.api.dto.AuthRequest;
import com.quanlynhankhau.api.util.JwtUtil;

@Service
public class AuthService {
    
    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private JwtUtil jwtUtil;

    public String authenticate(AuthRequest authRequest) {
        // 1. Xác thực username và password
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(authRequest.getUsername(), authRequest.getPassword())
        );

        // 2. Nếu xác thực thành công, tải thông tin user
        final UserDetails userDetails = userDetailsService.loadUserByUsername(authRequest.getUsername());

        // 3. Tạo JWT token và trả về
        return jwtUtil.generateToken(userDetails);
    }
    
    // Tạo cặp access token và refresh token
    public Map<String, String> authenticateWithRefreshToken(AuthRequest authRequest) {
        // 1. Xác thực username và password
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(authRequest.getUsername(), authRequest.getPassword())
        );

        // 2. Nếu xác thực thành công, tải thông tin user
        final UserDetails userDetails = userDetailsService.loadUserByUsername(authRequest.getUsername());

        // 3. Tạo cặp token và trả về
        return jwtUtil.generateTokenPair(userDetails);
    }
    
    // Làm mới access token bằng refresh token
    public String refreshToken(String refreshToken) {
        try {
            // 1. Trích xuất username từ refresh token
            String username = jwtUtil.extractUsername(refreshToken);
            
            // 2. Tải thông tin user
            final UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            
            // 3. Xác thực refresh token
            if (jwtUtil.validateRefreshToken(refreshToken, userDetails)) {
                // 4. Tạo access token mới
                return jwtUtil.generateToken(userDetails);
            } else {
                throw new RuntimeException("Invalid refresh token");
            }
        } catch (Exception e) {
            throw new RuntimeException("Cannot refresh token: " + e.getMessage());
        }
    }
}