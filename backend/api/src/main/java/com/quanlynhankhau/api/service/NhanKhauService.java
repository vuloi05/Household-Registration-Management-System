// src/main/java/com/quanlynhankhau/api/service/NhanKhauService.java

package com.quanlynhankhau.api.service;

import java.util.List;

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

    // (Chúng ta sẽ thêm các phương thức Sửa và Xóa sau)
}