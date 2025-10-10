// src/main/java/com/quanlynhankhau/api/controller/NhanKhauController.java

package com.quanlynhankhau.api.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*; //import tất cả


import com.quanlynhankhau.api.entity.NhanKhau;
import com.quanlynhankhau.api.service.NhanKhauService;

@RestController
// --- ĐIỂM QUAN TRỌNG ---
// URL cơ sở cho controller này sẽ lồng trong URL của Hộ khẩu
@RequestMapping("/api/hokhau/{hoKhauId}/nhankhau") 
@CrossOrigin(origins = "http://localhost:5173")
public class NhanKhauController {

    @Autowired
    private NhanKhauService nhanKhauService;

    // API 1: Lấy danh sách nhân khẩu theo ID hộ khẩu
    // - Method: GET
    // - URL: http://localhost:8080/api/hokhau/{hoKhauId}/nhankhau
    @GetMapping
    public ResponseEntity<List<NhanKhau>> getNhanKhauByHoKhauId(@PathVariable Long hoKhauId) {
        List<NhanKhau> nhanKhauList = nhanKhauService.getAllNhanKhauByHoKhauId(hoKhauId);
        return new ResponseEntity<>(nhanKhauList, HttpStatus.OK);
    }

    // API 2: Tạo một nhân khẩu mới cho một hộ khẩu
    // - Method: POST
    // - URL: http://localhost:8080/api/hokhau/{hoKhauId}/nhankhau
    @PostMapping
    public ResponseEntity<NhanKhau> createNhanKhau(@PathVariable Long hoKhauId, @RequestBody NhanKhau nhanKhau) {
        NhanKhau savedNhanKhau = nhanKhauService.createNhanKhau(hoKhauId, nhanKhau);
        return new ResponseEntity<>(savedNhanKhau, HttpStatus.CREATED);
    }

        /**
     * API cập nhật một nhân khẩu đã tồn tại.
     */
    @PutMapping("/{nhanKhauId}")
    public ResponseEntity<NhanKhau> updateNhanKhau(
            @PathVariable Long hoKhauId, // Biến này vẫn cần để khớp với URL của RequestMapping
            @PathVariable Long nhanKhauId, 
            @RequestBody NhanKhau nhanKhauDetails) {
        
        NhanKhau updatedNhanKhau = nhanKhauService.updateNhanKhau(nhanKhauId, nhanKhauDetails);
        return new ResponseEntity<>(updatedNhanKhau, HttpStatus.OK);
    }

    /**
     * API xóa một nhân khẩu.
     */
    @DeleteMapping("/{nhanKhauId}")
    public ResponseEntity<Void> deleteNhanKhau(
            @PathVariable Long hoKhauId, // Biến này vẫn cần để khớp với URL của RequestMapping
            @PathVariable Long nhanKhauId) {
            
        nhanKhauService.deleteNhanKhau(nhanKhauId);
        return ResponseEntity.noContent().build();
    }
}