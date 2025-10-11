// src/main/java/com/quanlynhankhau/api/controller/KhoanThuController.java

package com.quanlynhankhau.api.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.quanlynhankhau.api.entity.KhoanThu;
import com.quanlynhankhau.api.service.KhoanThuService;
import org.springframework.web.bind.annotation.DeleteMapping; 
import org.springframework.web.bind.annotation.PathVariable; 
import org.springframework.web.bind.annotation.PutMapping;

@RestController
@RequestMapping("/api/khoanthu")
@CrossOrigin(origins = "http://localhost:5173")
public class KhoanThuController {

    @Autowired
    private KhoanThuService khoanThuService;

    /**
     * API lấy danh sách tất cả các khoản thu.
     * @return Danh sách các khoản thu.
     */
    @GetMapping
    public ResponseEntity<List<KhoanThu>> getAllKhoanThu() {
        List<KhoanThu> khoanThuList = khoanThuService.getAllKhoanThu();
        return new ResponseEntity<>(khoanThuList, HttpStatus.OK);
    }

    /**
     * API tạo một khoản thu mới.
     * @param khoanThu Dữ liệu của khoản thu mới từ request body.
     * @return Khoản thu đã được tạo và lưu.
     */
    @PostMapping
    public ResponseEntity<KhoanThu> createKhoanThu(@RequestBody KhoanThu khoanThu) {
        KhoanThu savedKhoanThu = khoanThuService.createKhoanThu(khoanThu);
        return new ResponseEntity<>(savedKhoanThu, HttpStatus.CREATED);
    }

        // ---ENDPOINT SỬA ---
    @PutMapping("/{id}")
    public ResponseEntity<KhoanThu> updateKhoanThu(@PathVariable Long id, @RequestBody KhoanThu khoanThuDetails) {
        KhoanThu updatedKhoanThu = khoanThuService.updateKhoanThu(id, khoanThuDetails);
        return new ResponseEntity<>(updatedKhoanThu, HttpStatus.OK);
    }

    // ---ENDPOINT XÓA ---
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteKhoanThu(@PathVariable Long id) {
        khoanThuService.deleteKhoanThu(id);
        return ResponseEntity.noContent().build();
    }
}