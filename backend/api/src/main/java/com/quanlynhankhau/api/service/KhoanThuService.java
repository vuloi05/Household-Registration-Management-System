// src/main/java/com/quanlynhankhau/api/service/KhoanThuService.java
package com.quanlynhankhau.api.service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors; // Thêm import

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.quanlynhankhau.api.dto.KhoanThuResponseDTO; // Thêm import
import com.quanlynhankhau.api.entity.KhoanThu;
import com.quanlynhankhau.api.repository.KhoanThuRepository;

@Service
public class KhoanThuService {

    @Autowired
    private KhoanThuRepository khoanThuRepository;
    
    // --- PHƯƠNG THỨC CHUYỂN ĐỔI ENTITY SANG DTO ---
    private KhoanThuResponseDTO convertToDTO(KhoanThu entity) {
        if (entity == null) return null;
        
        KhoanThuResponseDTO dto = new KhoanThuResponseDTO();
        dto.setId(entity.getId());
        dto.setTenKhoanThu(entity.getTenKhoanThu());
        dto.setNgayTao(entity.getNgayTao());
        dto.setLoaiKhoanThu(entity.getLoaiKhoanThu());
        dto.setSoTienTrenMotNhanKhau(entity.getSoTienTrenMotNhanKhau());
        
        return dto;
    }

    // --- CÁC PHƯƠNG THỨC PUBLIC ĐƯỢC CẬP NHẬT ĐỂ TRẢ VỀ DTO ---

    // Lấy danh sách tất cả các khoản thu
    public List<KhoanThuResponseDTO> getAllKhoanThu() {
        return khoanThuRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    // Lấy chi tiết một khoản thu theo ID
    public KhoanThuResponseDTO getKhoanThuById(Long id) {
        KhoanThu khoanThu = khoanThuRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy khoản thu với ID: " + id));
        return convertToDTO(khoanThu);
    }

    // Tạo một khoản thu mới
    public KhoanThuResponseDTO createKhoanThu(KhoanThu khoanThu) {
        khoanThu.setNgayTao(LocalDate.now());
        KhoanThu savedKhoanThu = khoanThuRepository.save(khoanThu);
        return convertToDTO(savedKhoanThu);
    }
    
    // Cập nhật một khoản thu
    public KhoanThuResponseDTO updateKhoanThu(Long id, KhoanThu khoanThuDetails) {
        KhoanThu existingKhoanThu = khoanThuRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khoản thu với id: " + id));

        existingKhoanThu.setTenKhoanThu(khoanThuDetails.getTenKhoanThu());
        existingKhoanThu.setLoaiKhoanThu(khoanThuDetails.getLoaiKhoanThu());
        existingKhoanThu.setSoTienTrenMotNhanKhau(khoanThuDetails.getSoTienTrenMotNhanKhau());
        
        KhoanThu updatedKhoanThu = khoanThuRepository.save(existingKhoanThu);
        return convertToDTO(updatedKhoanThu);
    }

    // Xóa một khoản thu (giữ nguyên)
    public void deleteKhoanThu(Long id) {
        if (!khoanThuRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy khoản thu với id: " + id);
        }
        khoanThuRepository.deleteById(id);
    }
}