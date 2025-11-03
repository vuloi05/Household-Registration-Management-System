// src/main/java/com/quanlynhankhau/api/repository/LichSuThayDoiHoKhauRepository.java

package com.quanlynhankhau.api.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.quanlynhankhau.api.entity.LichSuThayDoiHoKhau;

@Repository
public interface LichSuThayDoiHoKhauRepository extends JpaRepository<LichSuThayDoiHoKhau, Long> {

    /**
     * Tìm tất cả lịch sử thay đổi của một hộ khẩu
     * Sắp xếp theo thời gian mới nhất
     */
    List<LichSuThayDoiHoKhau> findByHoKhauIdOrderByNgayThayDoiDesc(Long hoKhauId);

    /**
     * Tìm lịch sử thay đổi theo loại
     */
    List<LichSuThayDoiHoKhau> findByLoaiThayDoiOrderByNgayThayDoiDesc(String loaiThayDoi);

    /**
     * Tìm lịch sử thay đổi trong khoảng thời gian
     */
    @Query("SELECT ls FROM LichSuThayDoiHoKhau ls WHERE ls.ngayThayDoi BETWEEN :tuNgay AND :denNgay ORDER BY ls.ngayThayDoi DESC")
    List<LichSuThayDoiHoKhau> findByNgayThayDoiBetween(
            @Param("tuNgay") LocalDate tuNgay,
            @Param("denNgay") LocalDate denNgay
    );

    /**
     * Tìm các lần thay đổi chủ hộ liên quan đến một nhân khẩu cụ thể
     */
    @Query("SELECT ls FROM LichSuThayDoiHoKhau ls WHERE ls.chuHoCu.id = :nhanKhauId OR ls.chuHoMoi.id = :nhanKhauId ORDER BY ls.ngayThayDoi DESC")
    List<LichSuThayDoiHoKhau> findByChuHoRelated(@Param("nhanKhauId") Long nhanKhauId);
}