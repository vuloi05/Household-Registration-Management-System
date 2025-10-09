// src/main/java/com/quanlynhankhau/api/controller/NhanKhauController.java

package com.quanlynhankhau.api.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}