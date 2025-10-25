// src/main/java/com/quanlynhankhau/api/controller/NhanKhauManagementController.java

package com.quanlynhankhau.api.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.quanlynhankhau.api.dto.NhanKhauDTO;
import com.quanlynhankhau.api.entity.NhanKhau;
import com.quanlynhankhau.api.service.NhanKhauManagementService;

/**
 * Controller quản lý nhân khẩu (tất cả nhân khẩu trong hệ thống).
 * Khác với NhanKhauController (quản lý nhân khẩu theo hộ khẩu).
 */
@RestController
@RequestMapping("/api/nhankhau-management")
@CrossOrigin(origins = "http://localhost:5173")
public class NhanKhauManagementController {

    @Autowired
    private NhanKhauManagementService nhanKhauManagementService;

    /**
     * API lấy tất cả nhân khẩu với phân trang, tìm kiếm và lọc.
     * - Method: GET
     * - URL: http://localhost:8080/api/nhankhau-management
     * - Params:
     *   + page: Trang hiện tại (bắt đầu từ 0)
     *   + size: Số lượng bản ghi mỗi trang
     *   + search: Tìm kiếm theo tên hoặc CCCD
     *   + ageFilter: Lọc theo độ tuổi (under18, 18-35, 36-60, over60)
     *   + genderFilter: Lọc theo giới tính (Nam, Nữ)
     *   + locationFilter: Lọc theo địa chỉ (một phần địa chỉ)
     */
    @GetMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> getAllNhanKhau(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String ageFilter,
            @RequestParam(required = false) String genderFilter,
            @RequestParam(required = false) String locationFilter) {

        try {
            Pageable paging = PageRequest.of(page, size, Sort.by("id").descending());
            
            Page<NhanKhauDTO> pageNhanKhau = nhanKhauManagementService.getAllNhanKhauWithFilters(
                search, ageFilter, genderFilter, locationFilter, paging);

            List<NhanKhauDTO> nhanKhauList = pageNhanKhau.getContent();

            Map<String, Object> response = new HashMap<>();
            response.put("data", nhanKhauList);
            response.put("currentPage", pageNhanKhau.getNumber());
            response.put("totalItems", pageNhanKhau.getTotalElements());
            response.put("totalPages", pageNhanKhau.getTotalPages());

            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * API lấy chi tiết một nhân khẩu theo ID.
     * - Method: GET
     * - URL: http://localhost:8080/api/nhankhau-management/{id}
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<NhanKhauDTO> getNhanKhauById(@PathVariable Long id) {
        NhanKhauDTO nhanKhau = nhanKhauManagementService.getNhanKhauById(id);
        if (nhanKhau != null) {
            return new ResponseEntity<>(nhanKhau, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    /**
     * API tạo mới nhân khẩu (không cần thuộc hộ khẩu cụ thể).
     * - Method: POST
     * - URL: http://localhost:8080/api/nhankhau-management
     */
    @PostMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<NhanKhau> createNhanKhau(@RequestBody NhanKhau nhanKhau) {
        try {
            NhanKhau savedNhanKhau = nhanKhauManagementService.createNhanKhau(nhanKhau);
            return new ResponseEntity<>(savedNhanKhau, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * API cập nhật thông tin nhân khẩu.
     * - Method: PUT
     * - URL: http://localhost:8080/api/nhankhau-management/{id}
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<NhanKhau> updateNhanKhau(
            @PathVariable Long id,
            @RequestBody NhanKhau nhanKhauDetails) {
        try {
            NhanKhau updatedNhanKhau = nhanKhauManagementService.updateNhanKhau(id, nhanKhauDetails);
            return new ResponseEntity<>(updatedNhanKhau, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    /**
     * API xóa nhân khẩu.
     * - Method: DELETE
     * - URL: http://localhost:8080/api/nhankhau-management/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteNhanKhau(@PathVariable Long id) {
        try {
            nhanKhauManagementService.deleteNhanKhau(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}
