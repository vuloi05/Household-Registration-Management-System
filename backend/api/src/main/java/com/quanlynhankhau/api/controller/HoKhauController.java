// src/main/java/com/quanlynhankhau/api/controller/HoKhauController.java

package com.quanlynhankhau.api.controller;

import com.quanlynhankhau.api.dto.HoKhauRequest;
import com.quanlynhankhau.api.dto.HoKhauResponseDTO; // <<< THÊM 1: Import DTO Response
import com.quanlynhankhau.api.entity.HoKhau;
import com.quanlynhankhau.api.service.HoKhauService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@RestController // Đánh dấu đây là một REST Controller, chuyên xử lý API và trả về JSON
@RequestMapping("/api/hokhau") // Tất cả các API trong class này sẽ có tiền tố là /api/hokhau
@CrossOrigin(origins = "http://localhost:5173") // Cho phép frontend (chạy ở port 5173) gọi các API này
public class HoKhauController {

    @Autowired
    private HoKhauService hoKhauService;

    // <<< CẬP NHẬT 2: Sửa kiểu trả về sang List<HoKhauResponseDTO> >>>
    // API 1: Lấy danh sách tất cả hộ khẩu
    // - Method: GET
    // - URL: http://localhost:8080/api/hokhau
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTANT')") //Cho phép cả ADMIN và KETOAN xem
    public ResponseEntity<List<HoKhauResponseDTO>> getAllHoKhau() {
        List<HoKhauResponseDTO> hoKhauList = hoKhauService.getAllHoKhau();
        return new ResponseEntity<>(hoKhauList, HttpStatus.OK);
    }

    // <<< CẬP NHẬT 3: Sửa kiểu trả về sang HoKhauResponseDTO >>>
    // API 5: Lấy thông tin chi tiết của một hộ khẩu
    // - Method: GET
    // - URL: http://localhost:8080/api/hokhau/{id}
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTANT')") //Cho phép cả ADMIN và KETOAN xem
    public ResponseEntity<HoKhauResponseDTO> getHoKhauById(@PathVariable Long id) {
        HoKhauResponseDTO hoKhau = hoKhauService.getHoKhauById(id);
        return new ResponseEntity<>(hoKhau, HttpStatus.OK);
    }
    
    // <<< CẬP NHẬT 4: Sửa kiểu trả về sang HoKhauResponseDTO >>>
    // API 2: Tạo một hộ khẩu mới (cùng với chủ hộ)
    // - Method: POST
    // - URL: http://localhost:8080/api/hokhau
    @PostMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')") // Chỉ ADMIN mới được tạo hộ khẩu
    public ResponseEntity<HoKhauResponseDTO> createHoKhau(@RequestBody HoKhauRequest request) {
        HoKhauResponseDTO savedHoKhau = hoKhauService.createHoKhau(request);
        return new ResponseEntity<>(savedHoKhau, HttpStatus.CREATED);
    }

    // <<< CẬP NHẬT 5: Sửa kiểu trả về sang HoKhauResponseDTO >>>
    // API 3: Cập nhật một hộ khẩu đã có
    // - Method: PUT
    // - URL: http://localhost:8080/api/hokhau/{id}  (ví dụ: /api/hokhau/1)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<HoKhauResponseDTO> updateHoKhau(@PathVariable Long id, @RequestBody HoKhau hoKhauDetails) {
        // Lưu ý: hoKhauDetails ở đây vẫn là Entity HoKhau.
        // Spring Boot sẽ tự động map JSON đầu vào vào object này.
        // Service sẽ chỉ sử dụng các trường cần thiết từ nó.
        HoKhauResponseDTO updatedHoKhau = hoKhauService.updateHoKhau(id, hoKhauDetails);
        return new ResponseEntity<>(updatedHoKhau, HttpStatus.OK);
    }

    // API 4: Xóa một hộ khẩu theo id (giữ nguyên, không có thay đổi)
    // - Method: DELETE
    // - URL: http://localhost:8080/api/hokhau/{id}
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteHoKhau(@PathVariable Long id) {
        hoKhauService.deleteHoKhau(id);
        // Trả về status 204 No Content, báo hiệu đã xóa thành công và không có nội dung gì trả về
        return ResponseEntity.noContent().build();
    }
}