// src/main/java/com/quanlynhankhau/api/controller/MobileAuthController.java

package com.quanlynhankhau.api.controller;

import com.quanlynhankhau.api.entity.NhanKhau;
import com.quanlynhankhau.api.repository.NhanKhauRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/mobile/auth")
@CrossOrigin(origins = "*")
public class MobileAuthController {

    @Autowired
    private NhanKhauRepository nhanKhauRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * API đăng nhập cho mobile app - dùng CCCD và password
     * - Method: POST
     * - URL: http://localhost:8080/api/mobile/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        try {
            String cmndCccd = loginRequest.get("cccd");
            String password = loginRequest.get("password");

            if (cmndCccd == null || password == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "CCCD và mật khẩu không được để trống"));
            }

            // Tìm nhân khẩu theo CCCD
            Optional<NhanKhau> nhanKhauOpt = nhanKhauRepository.findByCmndCccd(cmndCccd);

            if (nhanKhauOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "Không tìm thấy người dùng với CCCD này"));
            }

            NhanKhau nhanKhau = nhanKhauOpt.get();

            // Kiểm tra mật khẩu (so sánh plain text vì chúng ta lưu plain text)
            // Hoặc bạn có thể encode password trong data.sql
            if (!password.equals(nhanKhau.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "Mật khẩu không đúng"));
            }

            // Nếu đăng nhập thành công, trả về thông tin đơn giản
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Đăng nhập thành công");
            response.put("data", Map.of(
                "hoTen", nhanKhau.getHoTen(),
                "cmndCccd", nhanKhau.getCmndCccd(),
                "ngaySinh", nhanKhau.getNgaySinh().toString(),
                "quanHeVoiChuHo", nhanKhau.getQuanHeVoiChuHo()
            ));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Lỗi khi đăng nhập: " + e.getMessage()));
        }
    }
}

