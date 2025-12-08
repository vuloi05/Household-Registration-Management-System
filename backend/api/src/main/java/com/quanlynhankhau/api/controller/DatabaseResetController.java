package com.quanlynhankhau.api.controller;

import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

/**
 * Controller để reset database trong môi trường development.
 * CHỈ SỬ DỤNG TRONG MÔI TRƯỜNG DEVELOPMENT!
 */
@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class DatabaseResetController {

    private final JdbcTemplate jdbcTemplate;

    public DatabaseResetController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    /**
     * Reset hoàn toàn database và đồng bộ sequence.
     * CHỈ SỬ DỤNG TRONG MÔI TRƯỜNG DEVELOPMENT!
     */
    @PostMapping("/reset-database")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> resetDatabase() {
        try {
            // Đọc script reset từ file
            ClassPathResource resource = new ClassPathResource("reset-database.sql");
            String sqlScript = new String(resource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
            
            // Chia script thành các câu lệnh riêng biệt
            String[] statements = sqlScript.split(";");
            
            // Thực thi từng câu lệnh
            for (String statement : statements) {
                String trimmedStatement = statement.trim();
                if (!trimmedStatement.isEmpty() && !trimmedStatement.startsWith("--")) {
                    try {
                        jdbcTemplate.execute(trimmedStatement);
                    } catch (Exception e) {
                        // Bỏ qua lỗi nếu sequence không tồn tại
                        if (!e.getMessage().contains("does not exist")) {
                            throw e;
                        }
                    }
                }
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Database đã được reset thành công");
            response.put("timestamp", java.time.LocalDateTime.now());
            
            return new ResponseEntity<>(response, HttpStatus.OK);
            
        } catch (IOException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Không thể đọc file reset script: " + e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Lỗi khi reset database: " + e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
