// src/main/java/com/quanlynhankhau/api/repository/LichSuBienDongRepository.java

package com.quanlynhankhau.api.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.quanlynhankhau.api.entity.LichSuBienDongNhanKhau;

@Repository
public interface LichSuBienDongRepository extends JpaRepository<LichSuBienDongNhanKhau, Long> {

    /**
     * Tìm tất cả lịch sử biến động của một nhân khẩu
     * Sắp xếp theo thời gian mới nhất
     */
    List<LichSuBienDongNhanKhau> findByNhanKhauIdOrderByNgayBienDongDesc(Long nhanKhauId);

    /**
     * Tìm lịch sử biến động theo loại biến động
     */
    List<LichSuBienDongNhanKhau> findByLoaiBienDongOrderByNgayBienDongDesc(String loaiBienDong);

    /**
     * Tìm lịch sử biến động trong khoảng thời gian
     */
    @Query("SELECT ls FROM LichSuBienDongNhanKhau ls WHERE ls.ngayBienDong BETWEEN :tuNgay AND :denNgay ORDER BY ls.ngayBienDong DESC")
    List<LichSuBienDongNhanKhau> findByNgayBienDongBetween(
            @Param("tuNgay") LocalDate tuNgay,
            @Param("denNgay") LocalDate denNgay
    );

    /**
     * Tìm lịch sử biến động của một hộ khẩu (qua quan hệ với nhân khẩu)
     */
    @Query("SELECT ls FROM LichSuBienDongNhanKhau ls WHERE ls.nhanKhau.hoKhau.id = :hoKhauId ORDER BY ls.ngayBienDong DESC")
    List<LichSuBienDongNhanKhau> findByHoKhauId(@Param("hoKhauId") Long hoKhauId);

    /**
     * Đếm số lượng biến động theo loại trong khoảng thời gian
     */
    @Query("SELECT COUNT(ls) FROM LichSuBienDongNhanKhau ls WHERE ls.loaiBienDong = :loai AND ls.ngayBienDong BETWEEN :tuNgay AND :denNgay")
    Long countByLoaiAndNgayBetween(
            @Param("loai") String loai,
            @Param("tuNgay") LocalDate tuNgay,
            @Param("denNgay") LocalDate denNgay
    );
}