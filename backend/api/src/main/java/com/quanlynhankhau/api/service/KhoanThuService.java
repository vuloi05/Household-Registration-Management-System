// src/main/java/com/quanlynhankhau/api/service/KhoanThuService.java

package com.quanlynhankhau.api.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.quanlynhankhau.api.entity.KhoanThu;
import com.quanlynhankhau.api.repository.KhoanThuRepository;

@Service
public class KhoanThuService {

    @Autowired
    private KhoanThuRepository khoanThuRepository;

    // Lấy danh sách tất cả các khoản thu
    public List<KhoanThu> getAllKhoanThu() {
        return khoanThuRepository.findAll();
    }

    // Tạo một khoản thu mới
    public KhoanThu createKhoanThu(KhoanThu khoanThu) {
        // Tự động gán ngày tạo là ngày hiện tại
        khoanThu.setNgayTao(LocalDate.now());
        return khoanThuRepository.save(khoanThu);
    }

     // --- THÊM PHƯƠNG THỨC SỬA ---
    public KhoanThu updateKhoanThu(Long id, KhoanThu khoanThuDetails) {
        KhoanThu existingKhoanThu = khoanThuRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khoản thu với id: " + id));

        existingKhoanThu.setTenKhoanThu(khoanThuDetails.getTenKhoanThu());
        existingKhoanThu.setLoaiKhoanThu(khoanThuDetails.getLoaiKhoanThu());
        existingKhoanThu.setSoTienTrenMotNhanKhau(khoanThuDetails.getSoTienTrenMotNhanKhau());
        
        return khoanThuRepository.save(existingKhoanThu);
    }

    // --- THÊM PHƯƠNG THỨC XÓA ---
    public void deleteKhoanThu(Long id) {
        if (!khoanThuRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy khoản thu với id: " + id);
        }
        khoanThuRepository.deleteById(id);
    }
}