// src/main/java/com/quanlynhankhau/api/repository/HoKhauRepository.java

package com.quanlynhankhau.api.repository;

import com.quanlynhankhau.api.entity.HoKhau;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository // Đánh dấu đây là một Spring Bean thuộc tầng Repository
public interface HoKhauRepository extends JpaRepository<HoKhau, Long> {
    // Tìm hộ khẩu theo mã hộ khẩu
    java.util.Optional<HoKhau> findByMaHoKhau(String maHoKhau);
}