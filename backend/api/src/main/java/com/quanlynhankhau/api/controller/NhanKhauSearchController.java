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
}

