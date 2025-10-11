// src/main/java/com/quanlynhankhau/api/controller/LichSuNopTienController.java

package com.quanlynhankhau.api.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.quanlynhankhau.api.dto.NopTienRequestDTO;
import com.quanlynhankhau.api.entity.LichSuNopTien;
import com.quanlynhankhau.api.service.LichSuNopTienService;

@RestController
@RequestMapping("/api/noptien") // Đặt một URL cơ sở riêng cho nghiệp vụ này
@CrossOrigin(origins = "http://localhost:5173")
public class LichSuNopTienController {

    @Autowired
    private LichSuNopTienService lichSuNopTienService;

    /**
     * API để ghi nhận một lần nộp tiền mới.
     * @param request DTO chứa thông tin về lần nộp tiền.
     * @return Bản ghi LichSuNopTien đã được tạo.
     */
    @PostMapping
    public ResponseEntity<LichSuNopTien> ghiNhanNopTien(@RequestBody NopTienRequestDTO request) {
        LichSuNopTien savedRecord = lichSuNopTienService.ghiNhanNopTien(request);
        return new ResponseEntity<>(savedRecord, HttpStatus.CREATED);
    }
}