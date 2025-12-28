// src/main/java/com/quanlynhankhau/api/service/NhanKhauService.java

package com.quanlynhankhau.api.service;

import java.util.List;
import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.quanlynhankhau.api.controller.NhanKhauSearchController.NhanKhauFormValues;
import com.quanlynhankhau.api.dto.NhanKhauDTO;
import com.quanlynhankhau.api.entity.HoKhau;
import com.quanlynhankhau.api.entity.NhanKhau;
import com.quanlynhankhau.api.entity.User;
import com.quanlynhankhau.api.repository.HoKhauRepository;
import com.quanlynhankhau.api.repository.NhanKhauRepository;
import com.quanlynhankhau.api.repository.UserRepository;

@Service
public class NhanKhauService {

    private final NhanKhauRepository nhanKhauRepository;

    private final HoKhauRepository hoKhauRepository; // Cần repo này để tìm hộ khẩu

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    public NhanKhauService(NhanKhauRepository nhanKhauRepository, HoKhauRepository hoKhauRepository, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.nhanKhauRepository = nhanKhauRepository;
        this.hoKhauRepository = hoKhauRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Lấy tất cả nhân khẩu của một hộ khẩu cụ thể
    public List<NhanKhauDTO> getAllNhanKhauByHoKhauId(Long hoKhauId) {
        List<NhanKhau> nhanKhauList = nhanKhauRepository.findByHoKhauId(hoKhauId);
        return nhanKhauList.stream()
                .map(this::convertToDTO)
                .collect(java.util.stream.Collectors.toList());
    }

    // Thêm một nhân khẩu mới vào một hộ khẩu
    public NhanKhau createNhanKhau(Long hoKhauId, NhanKhau nhanKhau) {
        // 1. Tìm hộ khẩu cha mà nhân khẩu này sẽ thuộc về
        HoKhau hoKhau = hoKhauRepository.findById(hoKhauId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hộ khẩu với id: " + hoKhauId));

        // 2. Gán hộ khẩu cha cho nhân khẩu mới
        nhanKhau.setHoKhau(hoKhau);

        // 3. Lưu nhân khẩu mới vào CSDL
        NhanKhau savedNhanKhau = nhanKhauRepository.save(nhanKhau);

        // 4. Tự động tạo tài khoản user nếu nhân khẩu có CCCD
        createUserForNhanKhau(savedNhanKhau);

        return savedNhanKhau;
    }

    /**
     * Tự động tạo tài khoản user cho nhân khẩu nếu có CCCD và chưa có user
     * @param nhanKhau Nhân khẩu cần tạo user
     */
    private void createUserForNhanKhau(NhanKhau nhanKhau) {
        // Chỉ tạo user nếu nhân khẩu có CCCD
        if (nhanKhau.getCmndCccd() != null && !nhanKhau.getCmndCccd().trim().isEmpty()) {
            String cccd = nhanKhau.getCmndCccd().trim();
            
            // Kiểm tra xem đã có user với username = CCCD chưa
            Optional<User> existingUser = userRepository.findByUsername(cccd);
            
            if (existingUser.isEmpty()) {
                // Tạo user mới
                User newUser = new User();
                newUser.setUsername(cccd);
                newUser.setFullName(nhanKhau.getHoTen());
                newUser.setRole("ROLE_RESIDENT");
                // Hash password: quanlydancu@123
                newUser.setPassword(passwordEncoder.encode("quanlydancu@123"));
                
                userRepository.save(newUser);
            } else {
                // Nếu user đã tồn tại, cập nhật fullName nếu cần
                User user = existingUser.get();
                if (nhanKhau.getHoTen() != null && !nhanKhau.getHoTen().equals(user.getFullName())) {
                    user.setFullName(nhanKhau.getHoTen());
                    userRepository.save(user);
                }
            }
        }
    }

    
    /**
     * Cập nhật thông tin cho một nhân khẩu đã tồn tại.
     * @param nhanKhauId ID của nhân khẩu cần cập nhật.
     * @param nhanKhauDetails Đối tượng chứa thông tin mới.
     * @return Nhân khẩu sau khi đã được cập nhật.
     */
    public NhanKhau updateNhanKhau(Long nhanKhauId, NhanKhau nhanKhauDetails) {
        // 1. Tìm nhân khẩu trong CSDL
        NhanKhau existingNhanKhau = nhanKhauRepository.findById(nhanKhauId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân khẩu với id: " + nhanKhauId));

        // Lưu CCCD cũ để kiểm tra thay đổi

        // 2. Cập nhật các trường thông tin
        existingNhanKhau.setHoTen(nhanKhauDetails.getHoTen());
        existingNhanKhau.setBiDanh(nhanKhauDetails.getBiDanh());
        existingNhanKhau.setNgaySinh(nhanKhauDetails.getNgaySinh());
        existingNhanKhau.setGioiTinh(nhanKhauDetails.getGioiTinh());
        existingNhanKhau.setNoiSinh(nhanKhauDetails.getNoiSinh());
        existingNhanKhau.setCmndCccd(nhanKhauDetails.getCmndCccd());
        existingNhanKhau.setQuanHeVoiChuHo(nhanKhauDetails.getQuanHeVoiChuHo());
        existingNhanKhau.setQueQuan(nhanKhauDetails.getQueQuan());
        existingNhanKhau.setDanToc(nhanKhauDetails.getDanToc());
        existingNhanKhau.setNgheNghiep(nhanKhauDetails.getNgheNghiep());
        existingNhanKhau.setNoiLamViec(nhanKhauDetails.getNoiLamViec());
        existingNhanKhau.setNgayCap(nhanKhauDetails.getNgayCap());
        existingNhanKhau.setNoiCap(nhanKhauDetails.getNoiCap());
        
        // 3. Cập nhật hộ khẩu nếu có thay đổi
        if (nhanKhauDetails.getHoKhau() != null) {
            // Tìm hộ khẩu mới dựa trên ID
            HoKhau newHoKhau = hoKhauRepository.findById(nhanKhauDetails.getHoKhau().getId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy hộ khẩu với id: " + nhanKhauDetails.getHoKhau().getId()));
            existingNhanKhau.setHoKhau(newHoKhau);
        }

        // 4. Lưu lại
        NhanKhau updatedNhanKhau = nhanKhauRepository.save(existingNhanKhau);

        // 5. Xử lý user account:
        // - Nếu CCCD thay đổi: tạo user mới với CCCD mới (nếu có)
        // - Nếu CCCD không đổi hoặc được thêm mới: cập nhật hoặc tạo user
        if (updatedNhanKhau.getCmndCccd() != null && !updatedNhanKhau.getCmndCccd().trim().isEmpty()) {

            // Nếu CCCD thay đổi và có user cũ, không xóa user cũ (có thể đang được sử dụng)
            // Chỉ tạo user mới với CCCD mới nếu chưa có
            createUserForNhanKhau(updatedNhanKhau);
        }

        return updatedNhanKhau;
    }

    /**
     * Cập nhật thông tin profile cho người dùng đang đăng nhập (mobile).
     * @param cccd CCCD của người dùng (lấy từ Authentication Principal).
     * @param formValues DTO chứa các trường có thể chỉnh sửa.
     * @return Nhân khẩu sau khi đã được cập nhật.
     */
    public NhanKhau updateMyProfile(String cccd, NhanKhauFormValues formValues) {
        NhanKhau existingNhanKhau = nhanKhauRepository.findByCmndCccd(cccd)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân khẩu với cccd: " + cccd));

        // Chỉ cập nhật các trường cho phép
        if (formValues.getNgheNghiep() != null) {
            existingNhanKhau.setNgheNghiep(formValues.getNgheNghiep());
        }
        if (formValues.getNoiLamViec() != null) {
            existingNhanKhau.setNoiLamViec(formValues.getNoiLamViec());
        }

        return nhanKhauRepository.save(existingNhanKhau);
    }

    /**
     * Xóa một nhân khẩu khỏi CSDL.
     * @param nhanKhauId ID của nhân khẩu cần xóa.
     */
    public void deleteNhanKhau(Long nhanKhauId) {
        // Kiểm tra sự tồn tại trước khi xóa để có thông báo lỗi tốt hơn
        if (!nhanKhauRepository.existsById(nhanKhauId)) {
            throw new RuntimeException("Không tìm thấy nhân khẩu với id: " + nhanKhauId);
        }
        nhanKhauRepository.deleteById(nhanKhauId);
    }

    /**
     * Validate that a nhân khẩu belongs to the specified hộ khẩu.
     * @param nhanKhauId ID của nhân khẩu cần kiểm tra.
     * @param hoKhauId ID của hộ khẩu.
     * @throws RuntimeException if nhân khẩu doesn't exist or doesn't belong to the hộ khẩu.
     */
    public void validateNhanKhauBelongsToHoKhau(Long nhanKhauId, Long hoKhauId) {
        NhanKhau nhanKhau = nhanKhauRepository.findById(nhanKhauId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân khẩu với id: " + nhanKhauId));
        
        if (nhanKhau.getHoKhau() == null || !nhanKhau.getHoKhau().getId().equals(hoKhauId)) {
            throw new RuntimeException("Nhân khẩu không thuộc về hộ khẩu với id: " + hoKhauId);
        }
    }

    /**
     * Tìm nhân khẩu theo số CCCD.
     * @param cmndCccd Số CCCD cần tìm.
     * @return Optional chứa nhân khẩu nếu tìm thấy, empty nếu không tìm thấy.
     */
    public Optional<NhanKhau> findByCmndCccd(String cmndCccd) {
        return nhanKhauRepository.findByCmndCccd(cmndCccd);
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

}