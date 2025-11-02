// src/main/java/com/quanlynhankhau/api/controller/BienDongNhanKhauController.java

package com.quanlynhankhau.api.controller;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.quanlynhankhau.api.dto.BienDongNhanKhauDTO;
import com.quanlynhankhau.api.dto.ThayDoiChuHoRequest;
import com.quanlynhankhau.api.entity.LichSuThayDoiHoKhau;
import com.quanlynhankhau.api.service.BienDongNhanKhauService;

/**
 * Controller xử lý các API liên quan đến biến động nhân khẩu
 */
@RestController
@RequestMapping("/api/bien-dong")
@CrossOrigin(origins = "http://localhost:5173")
public class BienDongNhanKhauController {

    @Autowired
    private BienDongNhanKhauService bienDongService;

    /**
     * API ghi nhận biến động nhân khẩu (chuyển đi, qua đời, v.v.)
     * POST /api/bien-dong/nhan-khau
     */
    @PostMapping("/nhan-khau")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> ghiNhanBienDong(
            @RequestBody BienDongNhanKhauDTO request,
            Authentication authentication) {
        try {
            String nguoiGhiNhan = authentication.getName();
            BienDongNhanKhauDTO result = bienDongService.ghiNhanBienDong(request, nguoiGhiNhan);
            return new ResponseEntity<>(result, HttpStatus.CREATED);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * API lấy lịch sử biến động của một nhân khẩu
     * GET /api/bien-dong/nhan-khau/{nhanKhauId}
     */
    @GetMapping("/nhan-khau/{nhanKhauId}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<List<BienDongNhanKhauDTO>> getLichSuByNhanKhau(@PathVariable Long nhanKhauId) {
        List<BienDongNhanKhauDTO> lichSu = bienDongService.getLichSuByNhanKhauId(nhanKhauId);
        return ResponseEntity.ok(lichSu);
    }

    /**
     * API lấy lịch sử biến động của một hộ khẩu
     * GET /api/bien-dong/ho-khau/{hoKhauId}
     */
    @GetMapping("/ho-khau/{hoKhauId}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<List<BienDongNhanKhauDTO>> getLichSuByHoKhau(@PathVariable Long hoKhauId) {
        List<BienDongNhanKhauDTO> lichSu = bienDongService.getLichSuByHoKhauId(hoKhauId);
        return ResponseEntity.ok(lichSu);
    }

    /**
     * API lấy lịch sử biến động theo khoảng thời gian
     * GET /api/bien-dong/theo-thoi-gian?tuNgay=2025-01-01&denNgay=2025-12-31
     */
    @GetMapping("/theo-thoi-gian")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<List<BienDongNhanKhauDTO>> getLichSuByKhoangThoiGian(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate tuNgay,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate denNgay) {
        List<BienDongNhanKhauDTO> lichSu = bienDongService.getLichSuByKhoangThoiGian(tuNgay, denNgay);
        return ResponseEntity.ok(lichSu);
    }

    /**
     * API thống kê số lượng biến động theo loại
     * GET /api/bien-dong/thong-ke?loai=CHUYEN_DI&tuNgay=2025-01-01&denNgay=2025-12-31
     */
    @GetMapping("/thong-ke")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Map<String, Long>> thongKeBienDong(
            @RequestParam String loai,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate tuNgay,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate denNgay) {
        Long soLuong = bienDongService.thongKeBienDong(loai, tuNgay, denNgay);
        Map<String, Long> result = new HashMap<>();
        result.put("soLuong", soLuong);
        return ResponseEntity.ok(result);
    }

    /**
     * API thay đổi chủ hộ
     * POST /api/bien-dong/thay-doi-chu-ho
     */
    @PostMapping("/thay-doi-chu-ho")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> thayDoiChuHo(
            @RequestBody ThayDoiChuHoRequest request,
            Authentication authentication) {
        try {
            String nguoiGhiNhan = authentication.getName();
            bienDongService.thayDoiChuHo(request, nguoiGhiNhan);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Thay đổi chủ hộ thành công");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * API lấy lịch sử thay đổi của hộ khẩu
     * GET /api/bien-dong/lich-su-ho-khau/{hoKhauId}
     */
    @GetMapping("/lich-su-ho-khau/{hoKhauId}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<List<LichSuThayDoiHoKhau>> getLichSuThayDoiHoKhau(@PathVariable Long hoKhauId) {
        List<LichSuThayDoiHoKhau> lichSu = bienDongService.getLichSuThayDoiHoKhau(hoKhauId);
        return ResponseEntity.ok(lichSu);
    }
}