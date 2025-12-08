package com.quanlynhankhau.api.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*; //import tất cả
import org.springframework.security.access.prepost.PreAuthorize;

import com.quanlynhankhau.api.dto.NhanKhauDTO;
import com.quanlynhankhau.api.entity.NhanKhau;
import com.quanlynhankhau.api.service.NhanKhauService;

@RestController
// --- ĐIỂM QUAN TRỌNG ---
// URL cơ sở cho controller này sẽ lồng trong URL của Hộ khẩu
@RequestMapping("/api/hokhau/{hoKhauId}/nhankhau") 
@CrossOrigin(origins = "http://localhost:5173")

public class NhanKhauController {

    private final NhanKhauService nhanKhauService;

    public NhanKhauController(NhanKhauService nhanKhauService) {
        this.nhanKhauService = nhanKhauService;
    }

    // API 1: Lấy danh sách nhân khẩu theo ID hộ khẩu
    // - Method: GET
    // - URL: http://localhost:8080/api/hokhau/{hoKhauId}/nhankhau
    @GetMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<List<NhanKhauDTO>> getNhanKhauByHoKhauId(@PathVariable Long hoKhauId) {
        List<NhanKhauDTO> nhanKhauList = nhanKhauService.getAllNhanKhauByHoKhauId(hoKhauId);
        return new ResponseEntity<>(nhanKhauList, HttpStatus.OK);
    }

    // API 2: Tạo một nhân khẩu mới cho một hộ khẩu
    // - Method: POST
    // - URL: http://localhost:8080/api/hokhau/{hoKhauId}/nhankhau
    @PostMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<NhanKhau> createNhanKhau(@PathVariable Long hoKhauId, @RequestBody NhanKhau nhanKhau) {
        NhanKhau savedNhanKhau = nhanKhauService.createNhanKhau(hoKhauId, nhanKhau);
        return new ResponseEntity<>(savedNhanKhau, HttpStatus.CREATED);
    }

    /**
     * API cập nhật một nhân khẩu đã tồn tại.
     */
    @PutMapping("/{nhanKhauId}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<NhanKhau> updateNhanKhau(
            @PathVariable Long hoKhauId,
            @PathVariable Long nhanKhauId, 
            @RequestBody NhanKhau nhanKhauDetails) {
        
        // Validate that the nhân khẩu belongs to the specified hộ khẩu
        nhanKhauService.validateNhanKhauBelongsToHoKhau(nhanKhauId, hoKhauId);
        
        NhanKhau updatedNhanKhau = nhanKhauService.updateNhanKhau(nhanKhauId, nhanKhauDetails);
        return new ResponseEntity<>(updatedNhanKhau, HttpStatus.OK);
    }

    /**
     * API xóa một nhân khẩu.
     */
    @DeleteMapping("/{nhanKhauId}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteNhanKhau(
            @PathVariable Long hoKhauId,
            @PathVariable Long nhanKhauId) {
        
        // Validate that the nhân khẩu belongs to the specified hộ khẩu
        nhanKhauService.validateNhanKhauBelongsToHoKhau(nhanKhauId, hoKhauId);
            
        nhanKhauService.deleteNhanKhau(nhanKhauId);
        return ResponseEntity.noContent().build();
    }
}