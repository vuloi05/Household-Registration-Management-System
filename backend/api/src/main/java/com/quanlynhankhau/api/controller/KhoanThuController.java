// src/main/java/com/quanlynhankhau/api/controller/KhoanThuController.java

package com.quanlynhankhau.api.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.quanlynhankhau.api.dto.KhoanThuResponseDTO;
import com.quanlynhankhau.api.dto.LichSuNopTienResponseDTO;
import com.quanlynhankhau.api.dto.ThongKeKhoanThuDTO;
import com.quanlynhankhau.api.entity.KhoanThu;
import com.quanlynhankhau.api.service.KhoanThuService;
import com.quanlynhankhau.api.service.LichSuNopTienService; 

@RestController
@RequestMapping("/api/khoanthu")
public class KhoanThuController {

    @Autowired
    private KhoanThuService khoanThuService;

    @Autowired
    private LichSuNopTienService lichSuNopTienService;

    // Các endpoint CRUD cho Khoản thu, được phân quyền cho cả ADMIN và ACCOUNTANT

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTANT')")
    public ResponseEntity<List<KhoanThuResponseDTO>> getAllKhoanThu() {
        return ResponseEntity.ok(khoanThuService.getAllKhoanThu());
    }

    /**
     * Endpoint cho RESIDENT xem danh sách khoản thu (chỉ xem, không chỉnh sửa).
     * RESIDENT có thể xem các khoản thu để biết các khoản phí cần nộp.
     */
    @GetMapping("/public")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTANT', 'RESIDENT')")
    public ResponseEntity<List<KhoanThuResponseDTO>> getPublicKhoanThu() {
        return ResponseEntity.ok(khoanThuService.getAllKhoanThu());
    }

    // Thêm endpoint GET theo ID
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTANT')")
    public ResponseEntity<KhoanThuResponseDTO> getKhoanThuById(@PathVariable Long id) {
        return ResponseEntity.ok(khoanThuService.getKhoanThuById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTANT')")
    public ResponseEntity<KhoanThuResponseDTO> createKhoanThu(@RequestBody KhoanThu khoanThu) {
        return new ResponseEntity<>(khoanThuService.createKhoanThu(khoanThu), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTANT')")
    public ResponseEntity<KhoanThuResponseDTO> updateKhoanThu(@PathVariable Long id, @RequestBody KhoanThu khoanThuDetails) {
        return ResponseEntity.ok(khoanThuService.updateKhoanThu(id, khoanThuDetails));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTANT')")
    public ResponseEntity<Void> deleteKhoanThu(@PathVariable Long id) {
        khoanThuService.deleteKhoanThu(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * API lấy danh sách chi tiết các lần nộp tiền cho một khoản thu.
     * Ví dụ URL: GET /api/khoanthu/1/lichsu
     * @param id ID của khoản thu.
     * @return Danh sách các bản ghi lịch sử nộp tiền dưới dạng DTO chi tiết.
     */
    @GetMapping("/{id}/lichsu")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTANT')")
    public ResponseEntity<List<LichSuNopTienResponseDTO>> getLichSuNopTienByKhoanThuId(@PathVariable Long id) {
        List<LichSuNopTienResponseDTO> lichSuList = lichSuNopTienService.getLichSuByKhoanThuId(id);
        return ResponseEntity.ok(lichSuList);
    }

    /**
     * API lấy các số liệu thống kê cho một khoản thu.
     * Ví dụ URL: GET /api/khoanthu/1/thongke
     * @param id ID của khoản thu.
     * @return Một DTO chứa các thông tin thống kê.
     */
    @GetMapping("/{id}/thongke")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTANT')")
    public ResponseEntity<ThongKeKhoanThuDTO> getThongKeByKhoanThuId(@PathVariable Long id) {
        ThongKeKhoanThuDTO thongKe = lichSuNopTienService.getThongKeKhoanThu(id);
        return ResponseEntity.ok(thongKe);
    }

}