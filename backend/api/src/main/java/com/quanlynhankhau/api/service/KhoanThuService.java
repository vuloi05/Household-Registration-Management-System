// src/main/java/com/quanlynhankhau/api/service/KhoanThuService.java
package com.quanlynhankhau.api.service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors; // Thêm import

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.quanlynhankhau.api.dto.KhoanThuResponseDTO;
import com.quanlynhankhau.api.entity.KhoanThu;
import com.quanlynhankhau.api.entity.LichSuNopTien;
import com.quanlynhankhau.api.entity.NhanKhau;
import com.quanlynhankhau.api.repository.KhoanThuRepository;
import com.quanlynhankhau.api.repository.LichSuNopTienRepository;
import com.quanlynhankhau.api.repository.NhanKhauRepository;

import java.util.Optional;
import java.util.Set;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@Service
public class KhoanThuService {

    @Autowired
    private KhoanThuRepository khoanThuRepository;
    @Autowired
    private NhanKhauRepository nhanKhauRepository;
    @Autowired
    private LichSuNopTienRepository lichSuNopTienRepository;
    
    // --- PHƯƠNG THỨC CHUYỂN ĐỔI ENTITY SANG DTO ---
    private KhoanThuResponseDTO convertToDTO(KhoanThu entity, String trangThai) {
        if (entity == null) return null;
        
        KhoanThuResponseDTO dto = new KhoanThuResponseDTO();
        dto.setId(entity.getId());
        dto.setTenKhoanThu(entity.getTenKhoanThu());
        dto.setNgayTao(entity.getNgayTao());
        dto.setLoaiKhoanThu(entity.getLoaiKhoanThu());
        dto.setSoTienTrenMotNhanKhau(entity.getSoTienTrenMotNhanKhau());
        dto.setTrangThaiThanhToan(trangThai);
        
        return dto;
    }

    // --- CÁC PHƯƠNG THỨC PUBLIC ĐƯỢC CẬP NHẬT ĐỂ TRẢ VỀ DTO ---

    // Lấy danh sách tất cả các khoản thu
    public List<KhoanThuResponseDTO> getAllKhoanThu() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        Long hoKhauId = null;
        // Kiểm tra xem người dùng có phải là RESIDENT không
        if (authentication != null && authentication.isAuthenticated() &&
            authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_RESIDENT"))) {
            String username = authentication.getName(); // Lấy cccd
            Optional<NhanKhau> nhanKhauOpt = nhanKhauRepository.findByCmndCccd(username);
            if (nhanKhauOpt.isPresent() && nhanKhauOpt.get().getHoKhau() != null) {
                hoKhauId = nhanKhauOpt.get().getHoKhau().getId();
            }
        }

        List<KhoanThu> khoanThus = khoanThuRepository.findAll();

        // Nếu là resident, tính toán trạng thái đã nộp
        if (hoKhauId != null) {
            final Long finalHoKhauId = hoKhauId;
            // Lấy danh sách các khoản thu mà hộ khẩu này đã nộp
            List<LichSuNopTien> userPayments = lichSuNopTienRepository.findByHoKhauId(finalHoKhauId);
            Set<Long> paidKhoanThuIds = userPayments.stream()
                .map(p -> p.getKhoanThu().getId())
                .collect(Collectors.toSet());
            
            return khoanThus.stream()
                .map(kt -> {
                    boolean isPaid = paidKhoanThuIds.contains(kt.getId());
                    String status = "CHUA_NOP";
                    if (isPaid && "BAT_BUOC".equals(kt.getLoaiKhoanThu())) {
                        status = "DA_NOP";
                    }
                    // For DONG_GOP, status remains CHUA_NOP to allow multiple contributions
                    return convertToDTO(kt, status);
                })
                .collect(Collectors.toList());
        } else {
            // Đối với ADMIN hoặc ACCOUNTANT, không cần trạng thái cá nhân
            return khoanThus.stream()
                .map(kt -> convertToDTO(kt, null)) // Hoặc một trạng thái mặc định
                .collect(Collectors.toList());
        }
    }
    
    // Lấy chi tiết một khoản thu theo ID
    public KhoanThuResponseDTO getKhoanThuById(Long id) {
        KhoanThu khoanThu = khoanThuRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy khoản thu với ID: " + id));
        // Trạng thái không áp dụng khi xem chi tiết, nên là null
        return convertToDTO(khoanThu, null);
    }

    // Tạo một khoản thu mới
    public KhoanThuResponseDTO createKhoanThu(KhoanThu khoanThu) {
        khoanThu.setNgayTao(LocalDate.now());
        KhoanThu savedKhoanThu = khoanThuRepository.save(khoanThu);
        return convertToDTO(savedKhoanThu, null);
    }
    
    // Cập nhật một khoản thu
    public KhoanThuResponseDTO updateKhoanThu(Long id, KhoanThu khoanThuDetails) {
        KhoanThu existingKhoanThu = khoanThuRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khoản thu với id: " + id));

        existingKhoanThu.setTenKhoanThu(khoanThuDetails.getTenKhoanThu());
        existingKhoanThu.setLoaiKhoanThu(khoanThuDetails.getLoaiKhoanThu());
        existingKhoanThu.setSoTienTrenMotNhanKhau(khoanThuDetails.getSoTienTrenMotNhanKhau());
        
        KhoanThu updatedKhoanThu = khoanThuRepository.save(existingKhoanThu);
        return convertToDTO(updatedKhoanThu, null);
    }

    // Xóa một khoản thu (giữ nguyên)
    public void deleteKhoanThu(Long id) {
        if (!khoanThuRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy khoản thu với id: " + id);
        }
        khoanThuRepository.deleteById(id);
    }
}