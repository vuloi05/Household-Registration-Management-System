// src/main/java/com/quanlynhankhau/api/service/AuthService.java
package com.quanlynhankhau.api.service;

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
}