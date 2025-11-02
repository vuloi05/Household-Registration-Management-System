// src/main/java/com/quanlynhankhau/api/controller/ThongKeController.java
package com.quanlynhankhau.api.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.quanlynhankhau.api.dto.ThongKeTongQuanDTO;
import com.quanlynhankhau.api.service.ThongKeService;

@RestController
@RequestMapping("/api/thongke")
@CrossOrigin(origins = "http://localhost:5173")
public class ThongKeController {

    @Autowired
    private ThongKeService thongKeService;

    @GetMapping("/tongquan")
    public ResponseEntity<ThongKeTongQuanDTO> getThongKeTongQuan() {
        return ResponseEntity.ok(thongKeService.getThongKeTongQuan());
    }

    @GetMapping("/dotuoi")
    public ResponseEntity<Map<String, Long>> getThongKeTheoDoTuoi() {
        return ResponseEntity.ok(thongKeService.getThongKeTheoDoTuoi());
    }

    @GetMapping("/gioitinh")
    public ResponseEntity<Map<String, Long>> getThongKeTheoGioiTinh() {
        return ResponseEntity.ok(thongKeService.getThongKeTheoGioiTinh());
    }
}