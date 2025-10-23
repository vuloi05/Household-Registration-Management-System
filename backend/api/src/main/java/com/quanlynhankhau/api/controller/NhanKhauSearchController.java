// src/main/java/com/quanlynhankhau/api/controller/NhanKhauSearchController.java

package com.quanlynhankhau.api.controller;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import com.quanlynhankhau.api.entity.NhanKhau;
import com.quanlynhankhau.api.service.NhanKhauService;

@RestController
@RequestMapping("/api/nhankhau")
@CrossOrigin(origins = "http://localhost:5173")
public class NhanKhauSearchController {

    @Autowired
    private NhanKhauService nhanKhauService;

    /**
     * API tìm kiếm nhân khẩu theo số CCCD.
     * - Method: GET
     * - URL: http://localhost:8080/api/nhankhau/search?cmndCccd={cmndCccd}
     */
    @GetMapping("/search")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<NhanKhau> searchNhanKhauByCmndCccd(@RequestParam String cmndCccd) {
        Optional<NhanKhau> nhanKhau = nhanKhauService.findByCmndCccd(cmndCccd);
        if (nhanKhau.isPresent()) {
            return new ResponseEntity<>(nhanKhau.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    /**
     * API kiểm tra thông tin hộ khẩu hiện tại của nhân khẩu theo CCCD.
     * - Method: GET
     * - URL: http://localhost:8080/api/nhankhau/check-household?cmndCccd={cmndCccd}
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

