// src/main/java/com/quanlynhankhau/api/service/AuthService.java
package com.quanlynhankhau.api.service;

import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import com.quanlynhankhau.api.dto.AuthRequest;
import com.quanlynhankhau.api.dto.MobileAuthRequest;
import com.quanlynhankhau.api.entity.NhanKhau;
import com.quanlynhankhau.api.entity.User;
import com.quanlynhankhau.api.repository.NhanKhauRepository;
import com.quanlynhankhau.api.repository.UserRepository;
import com.quanlynhankhau.api.util.JwtUtil;

@Service
public class AuthService {
    
    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private NhanKhauRepository nhanKhauRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

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
    
    // Xác thực cho mobile app - chỉ cho phép nhân khẩu đăng nhập bằng CCCD
    public Map<String, String> authenticateMobile(MobileAuthRequest mobileAuthRequest) {
        String cccd = mobileAuthRequest.getCccd();
        String password = mobileAuthRequest.getPassword();
        
        // 1. Tìm nhân khẩu theo CCCD
        Optional<NhanKhau> nhanKhauOpt = nhanKhauRepository.findByCmndCccd(cccd);
        if (!nhanKhauOpt.isPresent()) {
            throw new RuntimeException("Không tìm thấy nhân khẩu với số CCCD: " + cccd);
        }
        
        NhanKhau nhanKhau = nhanKhauOpt.get();
        
        // 2. Tìm hoặc tạo User record cho nhân khẩu này
        Optional<User> userOpt = userRepository.findByUsername(cccd);
        User user;
        
        if (userOpt.isPresent()) {
            user = userOpt.get();
            
            // 3. Chặn admin và kế toán đăng nhập qua mobile
            if ("ROLE_ADMIN".equals(user.getRole()) || "ROLE_ACCOUNTANT".equals(user.getRole())) {
                throw new RuntimeException("Tài khoản admin và kế toán không thể đăng nhập qua ứng dụng mobile");
            }
            
            // 4. Nếu user có role ROLE_USER (từ data cũ), update thành ROLE_RESIDENT
            if ("ROLE_USER".equals(user.getRole())) {
                user.setRole("ROLE_RESIDENT");
                user = userRepository.save(user);
            }
        } else {
            // Tạo User record mới cho nhân khẩu
            user = new User();
            user.setUsername(cccd);
            // Mật khẩu mặc định cho tất cả nhân khẩu: quanlydancu@123
            user.setPassword(passwordEncoder.encode("quanlydancu@123"));
            user.setFullName(nhanKhau.getHoTen());
            user.setRole("ROLE_RESIDENT");
            user = userRepository.save(user);
        }
        
        // 5. Xác thực mật khẩu
        // Mật khẩu mặc định cho tất cả nhân khẩu: quanlydancu@123
        if (!passwordEncoder.matches(password, user.getPassword())) {
            // Nếu mật khẩu không khớp, kiểm tra xem có phải là mật khẩu mặc định không
            if (!"quanlydancu@123".equals(password)) {
                throw new RuntimeException("Mật khẩu không chính xác");
            }
            // Cập nhật mật khẩu nếu user có mật khẩu cũ
            user.setPassword(passwordEncoder.encode("quanlydancu@123"));
            userRepository.save(user);
        }
        
        // 6. Tạo cặp token và trả về (với role đã được cập nhật)
        return jwtUtil.generateTokenPair(user);
    }
}