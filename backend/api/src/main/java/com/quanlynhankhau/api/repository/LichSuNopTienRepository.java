// src/main/java/com/quanlynhankhau/api/repository/LichSuNopTienRepository.java

package com.quanlynhankhau.api.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.quanlynhankhau.api.entity.LichSuNopTien;

@Repository
public interface LichSuNopTienRepository extends JpaRepository<LichSuNopTien, Long> {
    
    // Tìm tất cả lịch sử nộp tiền của một hộ khẩu
    List<LichSuNopTien> findByHoKhauId(Long hoKhauId);

    // Tìm tất cả lịch sử nộp tiền của một khoản thu
    List<LichSuNopTien> findByKhoanThuId(Long khoanThuId);
}