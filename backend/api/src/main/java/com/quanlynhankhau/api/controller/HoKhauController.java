// src/main/java/com/quanlynhankhau/api/controller/HoKhauController.java

package com.quanlynhankhau.api.controller;

import com.quanlynhankhau.api.entity.HoKhau;
import com.quanlynhankhau.api.service.HoKhauService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController // Đánh dấu đây là một REST Controller, chuyên xử lý API và trả về JSON
@RequestMapping("/api/hokhau") // Tất cả các API trong class này sẽ có tiền tố là /api/hokhau
@CrossOrigin(origins = "http://localhost:5173") // Cho phép frontend (chạy ở port 5173) gọi các API này
public class HoKhauController {

    @Autowired
    private HoKhauService hoKhauService;

    // API 1: Lấy danh sách tất cả hộ khẩu
    // - Method: GET
    // - URL: http://localhost:8080/api/hokhau
    @GetMapping
    public ResponseEntity<List<HoKhau>> getAllHoKhau() {
        List<HoKhau> hoKhauList = hoKhauService.getAllHoKhau();
        return new ResponseEntity<>(hoKhauList, HttpStatus.OK);
    }

    // API 2: Tạo một hộ khẩu mới
    // - Method: POST
    // - URL: http://localhost:8080/api/hokhau
    @PostMapping
    public ResponseEntity<HoKhau> createHoKhau(@RequestBody HoKhau hoKhau) {
        HoKhau savedHoKhau = hoKhauService.createHoKhau(hoKhau);
        return new ResponseEntity<>(savedHoKhau, HttpStatus.CREATED);
    }

    // --- THÊM ENDPOINT MỚI ---
    // API 3: Cập nhật một hộ khẩu đã có
    // - Method: PUT
    // - URL: http://localhost:8080/api/hokhau/{id}  (ví dụ: /api/hokhau/1)
    @PutMapping("/{id}")
    public ResponseEntity<HoKhau> updateHoKhau(@PathVariable Long id, @RequestBody HoKhau hoKhauDetails) {
        HoKhau updatedHoKhau = hoKhauService.updateHoKhau(id, hoKhauDetails);
        return new ResponseEntity<>(updatedHoKhau, HttpStatus.OK);
    }

    // --- THÊM ENDPOINT MỚI ---
    // API 4: Xóa một hộ khẩu theo id
    // - Method: DELETE
    // - URL: http://localhost:8080/api/hokhau/{id}  (ví dụ: /api/hokhau/1)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHoKhau(@PathVariable Long id) {
        hoKhauService.deleteHoKhau(id);
        // Trả về status 204 No Content, báo hiệu đã xóa thành công và không có nội dung gì trả về
        return ResponseEntity.noContent().build();
    }

    // API 5: Lấy thông tin chi tiết của một hộ khẩu
    // - Method: GET
    // - URL: http://localhost:8080/api/hokhau/{id}
    @GetMapping("/{id}")
    public ResponseEntity<HoKhau> getHoKhauById(@PathVariable Long id) {
        HoKhau hoKhau = hoKhauService.getHoKhauById(id);
        return new ResponseEntity<>(hoKhau, HttpStatus.OK);
    }
}