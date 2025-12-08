// src/main/java/com/quanlynhankhau/api/service/NhanKhauManagementService.java

package com.quanlynhankhau.api.service;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.quanlynhankhau.api.dto.NhanKhauDTO;
import com.quanlynhankhau.api.entity.HoKhau;
import com.quanlynhankhau.api.entity.NhanKhau;
import com.quanlynhankhau.api.repository.HoKhauRepository;
import com.quanlynhankhau.api.repository.NhanKhauRepository;

/**
 * Service quản lý tất cả nhân khẩu trong hệ thống.
 */
@Service
public class NhanKhauManagementService {

    private final NhanKhauRepository nhanKhauRepository;

    private final HoKhauRepository hoKhauRepository;

    public NhanKhauManagementService(NhanKhauRepository nhanKhauRepository, HoKhauRepository hoKhauRepository) {
        this.nhanKhauRepository = nhanKhauRepository;
        this.hoKhauRepository = hoKhauRepository;
    }

    /**
     * Lấy tất cả nhân khẩu với phân trang và các bộ lọc.
     */
    public Page<NhanKhauDTO> getAllNhanKhauWithFilters(
            String search,
            String ageFilter,
            String genderFilter,
            String locationFilter,
            Pageable pageable) {

        // Lấy tất cả nhân khẩu từ database
        List<NhanKhau> allNhanKhau = nhanKhauRepository.findAll();

        // Áp dụng các bộ lọc
        List<NhanKhau> filteredList = allNhanKhau.stream()
                .filter(nk -> applySearchFilter(nk, search))
                .filter(nk -> applyAgeFilter(nk, ageFilter))
                .filter(nk -> applyGenderFilter(nk, genderFilter))
                .filter(nk -> applyLocationFilter(nk, locationFilter))
                .toList();

        // Phân trang thủ công
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), filteredList.size());

        List<NhanKhauDTO> pageContent = filteredList.subList(start, end).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        return new PageImpl<>(pageContent, pageable, filteredList.size());
    }

    /**
     * Convert entity NhanKhau sang DTO.
     */
    private NhanKhauDTO convertToDTO(NhanKhau nhanKhau) {
        NhanKhauDTO dto = new NhanKhauDTO();
        dto.setId(nhanKhau.getId());
        dto.setHoTen(nhanKhau.getHoTen());
        dto.setBiDanh(nhanKhau.getBiDanh());
        dto.setNgaySinh(nhanKhau.getNgaySinh());
        dto.setGioiTinh(nhanKhau.getGioiTinh());
        dto.setNoiSinh(nhanKhau.getNoiSinh());
        dto.setQueQuan(nhanKhau.getQueQuan());
        dto.setDanToc(nhanKhau.getDanToc());
        dto.setNgheNghiep(nhanKhau.getNgheNghiep());
        dto.setNoiLamViec(nhanKhau.getNoiLamViec());
        dto.setCmndCccd(nhanKhau.getCmndCccd());
        dto.setNgayCap(nhanKhau.getNgayCap());
        dto.setNoiCap(nhanKhau.getNoiCap());
        dto.setQuanHeVoiChuHo(nhanKhau.getQuanHeVoiChuHo());

        // Thông tin hộ khẩu
        if (nhanKhau.getHoKhau() != null) {
            dto.setHoKhauId(nhanKhau.getHoKhau().getId());
            dto.setMaHoKhau(nhanKhau.getHoKhau().getMaHoKhau());
            dto.setDiaChiHoKhau(nhanKhau.getHoKhau().getDiaChi());
        }

        return dto;
    }

    /**
     * Lọc theo tìm kiếm (chỉ tìm kiếm theo họ tên, CCCD, quê quán, ngày sinh).
     */
    private boolean applySearchFilter(NhanKhau nhanKhau, String search) {
        if (search == null || search.isEmpty()) {
            return true;
        }
        
        String searchLower = search.toLowerCase().trim();
        
        // Chuẩn bị các trường để tìm kiếm (chỉ 4 trường: họ tên, CCCD, quê quán, ngày sinh)
        String hoTenLower = nhanKhau.getHoTen() != null ? nhanKhau.getHoTen().toLowerCase() : "";
        String cmndCccdLower = nhanKhau.getCmndCccd() != null ? nhanKhau.getCmndCccd().toLowerCase() : "";
        String queQuanLower = nhanKhau.getQueQuan() != null ? nhanKhau.getQueQuan().toLowerCase() : "";
        String ngaySinhStr = nhanKhau.getNgaySinh() != null ? nhanKhau.getNgaySinh().toString() : "";
        
        // Tìm kiếm đơn giản: kiểm tra trong 4 trường
        if (hoTenLower.contains(searchLower) || 
            cmndCccdLower.contains(searchLower) ||
            queQuanLower.contains(searchLower) ||
            ngaySinhStr.contains(searchLower)) {
            return true;
        }
        
        // Tìm kiếm kết hợp nhiều trường
        String[] words = searchLower.split("\\s+");
        int matchCount = 0;
        
        for (String word : words) {
            if (!word.isEmpty()) {
                if (hoTenLower.contains(word) || 
                    cmndCccdLower.contains(word) ||
                    queQuanLower.contains(word) ||
                    ngaySinhStr.contains(word)) {
                    matchCount++;
                }
            }
        }
        
        // Trả về true nếu tất cả các từ đều khớp ít nhất một trường
        return matchCount == words.length;
    }

    /**
     * Lọc theo độ tuổi.
     */
    private boolean applyAgeFilter(NhanKhau nhanKhau, String ageFilter) {
        if (ageFilter == null || ageFilter.isEmpty()) {
            return true;
        }

        if (nhanKhau.getNgaySinh() == null) {
            return false;
        }

        int age = Period.between(nhanKhau.getNgaySinh(), LocalDate.now()).getYears();

        return switch (ageFilter) {
            case "under18" -> age < 18;
            case "18-35" -> age >= 18 && age <= 35;
            case "36-60" -> age >= 36 && age <= 60;
            case "over60" -> age > 60;
            default -> true;
        };
    }

    /**
     * Lọc theo giới tính.
     */
    private boolean applyGenderFilter(NhanKhau nhanKhau, String genderFilter) {
        if (genderFilter == null || genderFilter.isEmpty()) {
            return true;
        }
        
        if (nhanKhau.getGioiTinh() == null) {
            return false;
        }
        
        return nhanKhau.getGioiTinh().equalsIgnoreCase(genderFilter);
    }

    /**
     * Lọc theo quê quán hoặc địa chỉ hộ khẩu.
     */
    private boolean applyLocationFilter(NhanKhau nhanKhau, String locationFilter) {
        if (locationFilter == null || locationFilter.isEmpty() || locationFilter.equals("all")) {
            return true;
        }

        String locationFilterLower = locationFilter.toLowerCase();

        // Lọc theo quê quán của nhân khẩu
        if (nhanKhau.getQueQuan() != null) {
            if (nhanKhau.getQueQuan().toLowerCase().contains(locationFilterLower)) {
                return true;
            }
        }

        // Lọc theo địa chỉ hộ khẩu
        if (nhanKhau.getHoKhau() != null && nhanKhau.getHoKhau().getDiaChi() != null) {
            return nhanKhau.getHoKhau().getDiaChi().toLowerCase().contains(locationFilterLower);
        }

        return false;
    }

    /**
     * Lấy nhân khẩu theo ID.
     */
    public NhanKhauDTO getNhanKhauById(Long id) {
        NhanKhau nhanKhau = nhanKhauRepository.findById(id).orElse(null);
        return nhanKhau != null ? convertToDTO(nhanKhau) : null;
    }

    /**
     * Tạo mới nhân khẩu.
     */
    public NhanKhau createNhanKhau(NhanKhau nhanKhau) {
        // Nếu có hoKhauId trong request, cần gán hộ khẩu
        if (nhanKhau.getHoKhau() != null && nhanKhau.getHoKhau().getId() != null) {
            HoKhau hoKhau = hoKhauRepository.findById(nhanKhau.getHoKhau().getId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy hộ khẩu"));
            nhanKhau.setHoKhau(hoKhau);
        }
        
        // Đảm bảo ID không được set để tránh xung đột
        nhanKhau.setId(null);
        
        try {
            return nhanKhauRepository.save(nhanKhau);
        } catch (Exception e) {
            // Nếu có lỗi duplicate key, thử lại một lần nữa
            if (e.getMessage().contains("duplicate key") || e.getMessage().contains("23505")) {
                // Reset ID và thử lại
                nhanKhau.setId(null);
                return nhanKhauRepository.save(nhanKhau);
            }
            throw e;
        }
    }

    /**
     * Tạo mới nhân khẩu với mã hộ khẩu.
     */
    public NhanKhau createNhanKhauWithMaHoKhau(NhanKhau nhanKhau, String maHoKhau) {
        if (maHoKhau != null && !maHoKhau.trim().isEmpty()) {
            HoKhau hoKhau = hoKhauRepository.findByMaHoKhau(maHoKhau)
                    .orElseThrow(() -> new RuntimeException("Mã hộ khẩu không tồn tại: " + maHoKhau));
            nhanKhau.setHoKhau(hoKhau);
        }
        
        // Đảm bảo ID không được set để tránh xung đột
        nhanKhau.setId(null);
        
        try {
            return nhanKhauRepository.save(nhanKhau);
        } catch (Exception e) {
            // Nếu có lỗi duplicate key, thử lại một lần nữa
            if (e.getMessage().contains("duplicate key") || e.getMessage().contains("23505")) {
                // Reset ID và thử lại
                nhanKhau.setId(null);
                return nhanKhauRepository.save(nhanKhau);
            }
            throw e;
        }
    }

    /**
     * Cập nhật thông tin nhân khẩu.
     */
    public NhanKhau updateNhanKhau(Long id, NhanKhau nhanKhauDetails) {
        NhanKhau existingNhanKhau = nhanKhauRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân khẩu với id: " + id));

        // Cập nhật các trường
        existingNhanKhau.setHoTen(nhanKhauDetails.getHoTen());
        existingNhanKhau.setBiDanh(nhanKhauDetails.getBiDanh());
        existingNhanKhau.setNgaySinh(nhanKhauDetails.getNgaySinh());
        existingNhanKhau.setNoiSinh(nhanKhauDetails.getNoiSinh());
        existingNhanKhau.setQueQuan(nhanKhauDetails.getQueQuan());
        existingNhanKhau.setDanToc(nhanKhauDetails.getDanToc());
        existingNhanKhau.setNgheNghiep(nhanKhauDetails.getNgheNghiep());
        existingNhanKhau.setNoiLamViec(nhanKhauDetails.getNoiLamViec());
        existingNhanKhau.setCmndCccd(nhanKhauDetails.getCmndCccd());
        existingNhanKhau.setNgayCap(nhanKhauDetails.getNgayCap());
        existingNhanKhau.setNoiCap(nhanKhauDetails.getNoiCap());
        existingNhanKhau.setQuanHeVoiChuHo(nhanKhauDetails.getQuanHeVoiChuHo());

        // Cập nhật hộ khẩu nếu có
        if (nhanKhauDetails.getHoKhau() != null && nhanKhauDetails.getHoKhau().getId() != null) {
            HoKhau hoKhau = hoKhauRepository.findById(nhanKhauDetails.getHoKhau().getId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy hộ khẩu"));
            existingNhanKhau.setHoKhau(hoKhau);
        }

        return nhanKhauRepository.save(existingNhanKhau);
    }

    /**
     * Cập nhật thông tin nhân khẩu với mã hộ khẩu.
     */
    public NhanKhau updateNhanKhauWithMaHoKhau(Long id, NhanKhau nhanKhauDetails, String maHoKhau) {
        NhanKhau existingNhanKhau = nhanKhauRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân khẩu với id: " + id));

        // Cập nhật các trường
        existingNhanKhau.setHoTen(nhanKhauDetails.getHoTen());
        existingNhanKhau.setBiDanh(nhanKhauDetails.getBiDanh());
        existingNhanKhau.setNgaySinh(nhanKhauDetails.getNgaySinh());
        existingNhanKhau.setNoiSinh(nhanKhauDetails.getNoiSinh());
        existingNhanKhau.setQueQuan(nhanKhauDetails.getQueQuan());
        existingNhanKhau.setDanToc(nhanKhauDetails.getDanToc());
        existingNhanKhau.setNgheNghiep(nhanKhauDetails.getNgheNghiep());
        existingNhanKhau.setNoiLamViec(nhanKhauDetails.getNoiLamViec());
        existingNhanKhau.setCmndCccd(nhanKhauDetails.getCmndCccd());
        existingNhanKhau.setNgayCap(nhanKhauDetails.getNgayCap());
        existingNhanKhau.setNoiCap(nhanKhauDetails.getNoiCap());
        existingNhanKhau.setQuanHeVoiChuHo(nhanKhauDetails.getQuanHeVoiChuHo());

        // Cập nhật hộ khẩu dựa trên mã hộ khẩu
        if (maHoKhau != null && !maHoKhau.trim().isEmpty()) {
            HoKhau hoKhau = hoKhauRepository.findByMaHoKhau(maHoKhau)
                    .orElseThrow(() -> new RuntimeException("Mã hộ khẩu không tồn tại: " + maHoKhau));
            existingNhanKhau.setHoKhau(hoKhau);
        }

        return nhanKhauRepository.save(existingNhanKhau);
    }

    /**
     * Xóa nhân khẩu.
     */
    public void deleteNhanKhau(Long id) {
        if (!nhanKhauRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy nhân khẩu với id: " + id);
        }
        nhanKhauRepository.deleteById(id);
    }
}
