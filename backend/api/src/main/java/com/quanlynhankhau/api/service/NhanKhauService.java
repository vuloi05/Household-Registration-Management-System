// src/main/java/com/quanlynhankhau/api/service/NhanKhauService.java

package com.quanlynhankhau.api.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.quanlynhankhau.api.entity.HoKhau;
import com.quanlynhankhau.api.entity.NhanKhau;
import com.quanlynhankhau.api.repository.HoKhauRepository;
import com.quanlynhankhau.api.repository.NhanKhauRepository;

@Service
public class NhanKhauService {

    @Autowired
    private NhanKhauRepository nhanKhauRepository;

    @Autowired
    private HoKhauRepository hoKhauRepository; // Cần repo này để tìm hộ khẩu

    // Lấy tất cả nhân khẩu của một hộ khẩu cụ thể
    public List<NhanKhau> getAllNhanKhauByHoKhauId(Long hoKhauId) {
        return nhanKhauRepository.findByHoKhauId(hoKhauId);
    }

    // Thêm một nhân khẩu mới vào một hộ khẩu
    public NhanKhau createNhanKhau(Long hoKhauId, NhanKhau nhanKhau) {
        // 1. Tìm hộ khẩu cha mà nhân khẩu này sẽ thuộc về
        HoKhau hoKhau = hoKhauRepository.findById(hoKhauId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hộ khẩu với id: " + hoKhauId));

        // 2. Gán hộ khẩu cha cho nhân khẩu mới
        nhanKhau.setHoKhau(hoKhau);

        // 3. Lưu nhân khẩu mới vào CSDL
        return nhanKhauRepository.save(nhanKhau);
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
        // ... bạn có thể thêm các trường khác ở đây

        // 3. Lưu lại và trả về kết quả
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
     * Tìm nhân khẩu theo số CCCD.
     * @param cmndCccd Số CCCD cần tìm.
     * @return Optional chứa nhân khẩu nếu tìm thấy, empty nếu không tìm thấy.
     */
    public Optional<NhanKhau> findByCmndCccd(String cmndCccd) {
        return nhanKhauRepository.findByCmndCccd(cmndCccd);
    }

}