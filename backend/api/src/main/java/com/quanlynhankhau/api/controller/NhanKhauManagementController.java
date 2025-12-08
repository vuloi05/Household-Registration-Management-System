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
import com.quanlynhankhau.api.dto.NhanKhauRequestDTO;
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
     * - URL: <a href="http://localhost:8080/api/nhankhau-management">...</a>
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
     * - URL: <a href="http://localhost:8080/api/nhankhau-management/">...</a>{id}
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
     * - URL: <a href="http://localhost:8080/api/nhankhau-management">...</a>
     */
    @PostMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> createNhanKhau(@RequestBody NhanKhauRequestDTO requestDTO) {
        try {
            // Convert DTO to Entity
            NhanKhau nhanKhau = convertToEntity(requestDTO);
            
            // Tạo nhân khẩu với mã hộ khẩu nếu có
            NhanKhau savedNhanKhau;
            if (requestDTO.getMaHoKhau() != null && !requestDTO.getMaHoKhau().trim().isEmpty()) {
                savedNhanKhau = nhanKhauManagementService.createNhanKhauWithMaHoKhau(nhanKhau, requestDTO.getMaHoKhau());
            } else {
                savedNhanKhau = nhanKhauManagementService.createNhanKhau(nhanKhau);
            }
            
            return new ResponseEntity<>(savedNhanKhau, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Lỗi hệ thống: " + e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * API cập nhật thông tin nhân khẩu.
     * - Method: PUT
     * - URL: <a href="http://localhost:8080/api/nhankhau-management/">...</a>{id}
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> updateNhanKhau(
            @PathVariable Long id,
            @RequestBody NhanKhauRequestDTO requestDTO) {
        try {
            // Convert DTO to Entity
            NhanKhau nhanKhauDetails = convertToEntity(requestDTO);
            
            // Cập nhật nhân khẩu với mã hộ khẩu nếu có
            NhanKhau updatedNhanKhau;
            if (requestDTO.getMaHoKhau() != null && !requestDTO.getMaHoKhau().trim().isEmpty()) {
                updatedNhanKhau = nhanKhauManagementService.updateNhanKhauWithMaHoKhau(id, nhanKhauDetails, requestDTO.getMaHoKhau());
            } else {
                updatedNhanKhau = nhanKhauManagementService.updateNhanKhau(id, nhanKhauDetails);
            }
            
            return new ResponseEntity<>(updatedNhanKhau, HttpStatus.OK);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Lỗi hệ thống: " + e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * API xóa nhân khẩu.
     * - Method: DELETE
     * - URL: <a href="http://localhost:8080/api/nhankhau-management/">...</a>{id}
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

    /**
     * Convert NhanKhauRequestDTO to NhanKhau entity.
     */
    private NhanKhau convertToEntity(NhanKhauRequestDTO dto) {
        NhanKhau nhanKhau = new NhanKhau();
        nhanKhau.setHoTen(dto.getHoTen());
        nhanKhau.setBiDanh(dto.getBiDanh());
        nhanKhau.setNgaySinh(dto.getNgaySinh());
        nhanKhau.setGioiTinh(dto.getGioiTinh());
        nhanKhau.setNoiSinh(dto.getNoiSinh());
        nhanKhau.setQueQuan(dto.getQueQuan());
        nhanKhau.setDanToc(dto.getDanToc());
        nhanKhau.setNgheNghiep(dto.getNgheNghiep());
        nhanKhau.setNoiLamViec(dto.getNoiLamViec());
        nhanKhau.setCmndCccd(dto.getCmndCccd());
        nhanKhau.setNgayCap(dto.getNgayCap());
        nhanKhau.setNoiCap(dto.getNoiCap());
        nhanKhau.setNgayDangKyThuongTru(dto.getNgayDangKyThuongTru());
        nhanKhau.setDiaChiTruocKhiChuyenDen(dto.getDiaChiTruocKhiChuyenDen());
        nhanKhau.setQuanHeVoiChuHo(dto.getQuanHeVoiChuHo());
        return nhanKhau;
    }
}
