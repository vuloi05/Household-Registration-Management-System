// src/main/java/com/quanlynhankhau/api/controller/NhanKhauSearchController.java

package com.quanlynhankhau.api.controller;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import com.quanlynhankhau.api.entity.HoKhau;
import com.quanlynhankhau.api.entity.NhanKhau;
import com.quanlynhankhau.api.service.NhanKhauService;

@RestController
@RequestMapping("/api/nhankhau")
@CrossOrigin(origins = "*")
public class NhanKhauSearchController {

    @Autowired
    private NhanKhauService nhanKhauService;

    // DTO for updating user profile from mobile app
    public static class NhanKhauFormValues {
        private String ngheNghiep;
        private String noiLamViec;

        // Getters and Setters
        public String getNgheNghiep() {
            return ngheNghiep;
        }

        public void setNgheNghiep(String ngheNghiep) {
            this.ngheNghiep = ngheNghiep;
        }

        public String getNoiLamViec() {
            return noiLamViec;
        }

        public void setNoiLamViec(String noiLamViec) {
            this.noiLamViec = noiLamViec;
        }
    }

    /**
     * API Lấy thông tin cá nhân của người dùng đang đăng nhập (mobile).
     * - Method: GET
     * - URL: /api/nhankhau/me
     * - Role: RESIDENT
     */
    @GetMapping("/me")
    @PreAuthorize("hasRole('ROLE_RESIDENT')")
    public ResponseEntity<NhanKhau> getMyProfile(org.springframework.security.core.Authentication authentication) {
        String username = authentication.getName(); // CCCD
        return nhanKhauService.findByCmndCccd(username)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * API Lấy thông tin hộ khẩu của người dùng đang đăng nhập (mobile).
     * - Method: GET
     * - URL: /api/nhankhau/me/hokhau
     * - Role: RESIDENT
     */
    @GetMapping("/me/hokhau")
    @PreAuthorize("hasRole('ROLE_RESIDENT')")
    public ResponseEntity<HoKhau> getMyHoKhau(org.springframework.security.core.Authentication authentication) {
        String username = authentication.getName(); // CCCD
        Optional<NhanKhau> nhanKhauOpt = nhanKhauService.findByCmndCccd(username);

        if (nhanKhauOpt.isPresent() && nhanKhauOpt.get().getHoKhau() != null) {
            return ResponseEntity.ok(nhanKhauOpt.get().getHoKhau());
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * API Cập nhật thông tin cá nhân của người dùng đang đăng nhập (mobile).
     * - Method: PUT
     * - URL: /api/nhankhau/me
     * - Role: RESIDENT
     */
    @PutMapping("/me")
    @PreAuthorize("hasRole('ROLE_RESIDENT')")
    public ResponseEntity<NhanKhau> updateMyProfile(
            org.springframework.security.core.Authentication authentication,
            @RequestBody NhanKhauFormValues formValues) {
        String username = authentication.getName(); // CCCD
        try {
            NhanKhau updatedNhanKhau = nhanKhauService.updateMyProfile(username, formValues);
            return ResponseEntity.ok(updatedNhanKhau);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }


    /**
     * API tìm kiếm nhân khẩu theo số CCCD.
     * - Method: GET
     * - URL: <a href="http://localhost:8080/api/nhankhau/search?cmndCccd=">...</a>{cmndCccd}
     * - Cho phép ADMIN và RESIDENT (chỉ được tìm chính mình)
     */
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_RESIDENT')")
    public ResponseEntity<NhanKhau> searchNhanKhauByCmndCccd(
            @RequestParam String cmndCccd,
            org.springframework.security.core.Authentication authentication) {
        // RESIDENT chỉ được tìm thông tin của chính mình
        if (authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_RESIDENT"))) {
            String username = authentication.getName();
            if (!username.equals(cmndCccd)) {
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }
        }
        
        Optional<NhanKhau> nhanKhau = nhanKhauService.findByCmndCccd(cmndCccd);
        if (nhanKhau.isPresent()) {
            return new ResponseEntity<>(nhanKhau.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    /**
     * API lấy thông tin nhân khẩu của chính mình (cho mobile app)
     * - Method: GET
     * - URL: <a href="http://localhost:8080/api/nhankhau/my-info">...</a>
     */
    @GetMapping("/my-info")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_RESIDENT', 'ROLE_ACCOUNTANT')")
    public ResponseEntity<?> getMyInfo(org.springframework.security.core.Authentication authentication) {
        String username = authentication.getName();
        Optional<NhanKhau> nhanKhau = nhanKhauService.findByCmndCccd(username);
        if (nhanKhau.isPresent()) {
            // Chỉ trả về thông tin cần thiết
            var response = new java.util.HashMap<String, Object>();
            response.put("hoTen", nhanKhau.get().getHoTen());
            response.put("cmndCccd", nhanKhau.get().getCmndCccd());
            return new ResponseEntity<>(response, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    /**
     * API kiểm tra thông tin hộ khẩu hiện tại của nhân khẩu theo CCCD.
     * - Method: GET
     * - URL: <a href="http://localhost:8080/api/nhankhau/check-household?cmndCccd=">...</a>{cmndCccd}
     */
    @GetMapping("/check-household")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> checkHouseholdInfo(@RequestParam String cmndCccd) {
        Optional<NhanKhau> nhanKhau = nhanKhauService.findByCmndCccd(cmndCccd);
        if (nhanKhau.isPresent()) {
            NhanKhau person = nhanKhau.get();
            
            // Kiểm tra xem có phải chủ hộ không
            boolean isChuHo = "Chủ hộ".equals(person.getQuanHeVoiChuHo());
            
            // Tạo response object với thông tin hộ khẩu đơn giản
            var response = new java.util.HashMap<String, Object>();
            response.put("found", true);
            response.put("isChuHo", isChuHo);
            
            // Tạo thông tin hộ khẩu đơn giản để tránh lỗi serialization
            var householdInfo = new java.util.HashMap<String, Object>();
            if (person.getHoKhau() != null) {
                householdInfo.put("id", person.getHoKhau().getId());
                householdInfo.put("maHoKhau", person.getHoKhau().getMaHoKhau());
                householdInfo.put("diaChi", person.getHoKhau().getDiaChi());
            }
            response.put("currentHousehold", householdInfo);
            
            // Tạo thông tin nhân khẩu đơn giản
            var personInfo = new java.util.HashMap<String, Object>();
            personInfo.put("id", person.getId());
            personInfo.put("hoTen", person.getHoTen());
            personInfo.put("ngaySinh", person.getNgaySinh());
            personInfo.put("cmndCccd", person.getCmndCccd());
            personInfo.put("quanHeVoiChuHo", person.getQuanHeVoiChuHo());
            response.put("personInfo", personInfo);
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}

