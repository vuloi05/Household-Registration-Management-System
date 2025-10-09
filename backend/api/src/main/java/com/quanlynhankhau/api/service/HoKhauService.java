// src/main/java/com/quanlynhankhau/api/service/HoKhauService.java

package com.quanlynhankhau.api.service;

import com.quanlynhankhau.api.entity.HoKhau;
import com.quanlynhankhau.api.repository.HoKhauRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service // Đánh dấu đây là một Spring Bean thuộc tầng Service
public class HoKhauService {

    @Autowired // Tự động inject (tiêm) một instance của HoKhauRepository vào đây
    private HoKhauRepository hoKhauRepository;

    // Phương thức để lấy tất cả hộ khẩu
    public List<HoKhau> getAllHoKhau() {
        return hoKhauRepository.findAll();
    }

    // Phương thức để tạo một hộ khẩu mới
    public HoKhau createHoKhau(HoKhau hoKhau) {
        return hoKhauRepository.save(hoKhau);
    }

    // Phương thức để cập nhật một hộ khẩu đã có
    public HoKhau updateHoKhau(Long id, HoKhau hoKhauDetails) {
        // 1. Tìm hộ khẩu đã tồn tại trong CSDL bằng id
        HoKhau existingHoKhau = hoKhauRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hộ khẩu với id: " + id));

        // 2. Cập nhật các trường thông tin từ dữ liệu mới
        existingHoKhau.setMaHoKhau(hoKhauDetails.getMaHoKhau());
        existingHoKhau.setChuHo(hoKhauDetails.getChuHo());
        existingHoKhau.setDiaChi(hoKhauDetails.getDiaChi());

        // 3. Lưu lại hộ khẩu đã được cập nhật vào CSDL
        return hoKhauRepository.save(existingHoKhau);
    }

    // --- THÊM PHƯƠNG THỨC MỚI ---
    // Phương thức để xóa một hộ khẩu theo id
    public void deleteHoKhau(Long id) {
        // Kiểm tra xem hộ khẩu có tồn tại không trước khi xóa
        if (!hoKhauRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy hộ khẩu với id: " + id);
        }
        hoKhauRepository.deleteById(id);
    }

    // Phương thức để lấy một hộ khẩu theo ID
    public HoKhau getHoKhauById(Long id) {
        return hoKhauRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hộ khẩu với id: " + id));
    }
}