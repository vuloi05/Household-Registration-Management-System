// src/main/java/com/quanlynhankhau/api/controller/MobileController.java

package com.quanlynhankhau.api.controller;

import com.quanlynhankhau.api.entity.NhanKhau;
import com.quanlynhankhau.api.entity.HoKhau;
import com.quanlynhankhau.api.service.NhanKhauService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/mobile")
@CrossOrigin(origins = "*") // Cho phép mọi origin để mobile app có thể truy cập
public class MobileController {

    @Autowired
    private NhanKhauService nhanKhauService;

    /**
     * API công khai: Lấy thông tin hộ khẩu theo CCCD
     * - Method: GET
     * - URL: http://localhost:8080/api/mobile/household?cmndCccd={cmndCccd}
     */
    @GetMapping("/household")
    public ResponseEntity<?> getHouseholdByCmndCccd(@RequestParam String cmndCccd) {
        try {
            Optional<NhanKhau> nhanKhauOpt = nhanKhauService.findByCmndCccd(cmndCccd);
            
            if (nhanKhauOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Không tìm thấy nhân khẩu với CCCD: " + cmndCccd));
            }
            
            NhanKhau nhanKhau = nhanKhauOpt.get();
            HoKhau hoKhau = nhanKhau.getHoKhau();
            
            if (hoKhau == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Nhân khẩu chưa được đăng ký trong hộ khẩu nào"));
            }
            
            // Lấy danh sách nhân khẩu trong hộ
            List<NhanKhau> danhSachNhanKhau = hoKhau.getDanhSachNhanKhau();
            
            // Tạo response object
            Map<String, Object> response = new HashMap<>();
            response.put("id", hoKhau.getId());
            response.put("maHoKhau", hoKhau.getMaHoKhau());
            response.put("diaChi", hoKhau.getDiaChi());
            response.put("ngayLap", hoKhau.getNgayLap().toString());
            
            // Thông tin chủ hộ
            Map<String, Object> chuHoInfo = new HashMap<>();
            if (hoKhau.getChuHo() != null) {
                NhanKhau chuHo = hoKhau.getChuHo();
                chuHoInfo.put("id", chuHo.getId());
                chuHoInfo.put("hoTen", chuHo.getHoTen());
                chuHoInfo.put("ngaySinh", chuHo.getNgaySinh().toString());
                chuHoInfo.put("cmndCccd", chuHo.getCmndCccd());
                chuHoInfo.put("quanHeVoiChuHo", "Chủ hộ");
                if (chuHo.getGioiTinh() != null) {
                    chuHoInfo.put("gioiTinh", chuHo.getGioiTinh());
                }
                if (chuHo.getNoiSinh() != null) {
                    chuHoInfo.put("noiSinh", chuHo.getNoiSinh());
                }
                if (chuHo.getQueQuan() != null) {
                    chuHoInfo.put("queQuan", chuHo.getQueQuan());
                }
                if (chuHo.getNgheNghiep() != null) {
                    chuHoInfo.put("ngheNghiep", chuHo.getNgheNghiep());
                }
            }
            response.put("chuHo", chuHoInfo);
            
            // Danh sách nhân khẩu (đơn giản hóa)
            List<Map<String, Object>> danhSachNhanKhauSimplified = danhSachNhanKhau.stream()
                .map(nk -> {
                    Map<String, Object> info = new HashMap<>();
                    info.put("id", nk.getId());
                    info.put("hoTen", nk.getHoTen());
                    info.put("ngaySinh", nk.getNgaySinh().toString());
                    info.put("cmndCccd", nk.getCmndCccd());
                    info.put("quanHeVoiChuHo", nk.getQuanHeVoiChuHo());
                    if (nk.getGioiTinh() != null) {
                        info.put("gioiTinh", nk.getGioiTinh());
                    }
                    return info;
                })
                .toList();
            
            response.put("danhSachNhanKhau", danhSachNhanKhauSimplified);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Lỗi khi lấy thông tin: " + e.getMessage()));
        }
    }

    /**
     * API công khai: Kiểm tra thông tin nhân khẩu theo CCCD
     * - Method: GET
     * - URL: http://localhost:8080/api/mobile/person?cmndCccd={cmndCccd}
     */
    @GetMapping("/person")
    public ResponseEntity<?> getPersonByCmndCccd(@RequestParam String cmndCccd) {
        try {
            Optional<NhanKhau> nhanKhauOpt = nhanKhauService.findByCmndCccd(cmndCccd);
            
            if (nhanKhauOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Không tìm thấy nhân khẩu với CCCD: " + cmndCccd));
            }
            
            NhanKhau nhanKhau = nhanKhauOpt.get();
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", nhanKhau.getId());
            response.put("hoTen", nhanKhau.getHoTen());
            response.put("ngaySinh", nhanKhau.getNgaySinh().toString());
            response.put("cmndCccd", nhanKhau.getCmndCccd());
            response.put("quanHeVoiChuHo", nhanKhau.getQuanHeVoiChuHo());
            
            // Thông tin hộ khẩu
            if (nhanKhau.getHoKhau() != null) {
                Map<String, Object> hoKhauInfo = new HashMap<>();
                hoKhauInfo.put("id", nhanKhau.getHoKhau().getId());
                hoKhauInfo.put("maHoKhau", nhanKhau.getHoKhau().getMaHoKhau());
                hoKhauInfo.put("diaChi", nhanKhau.getHoKhau().getDiaChi());
                response.put("hoKhau", hoKhauInfo);
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Lỗi khi lấy thông tin: " + e.getMessage()));
        }
    }
}

