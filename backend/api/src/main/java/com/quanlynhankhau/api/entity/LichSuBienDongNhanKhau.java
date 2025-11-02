// src/main/java/com/quanlynhankhau/api/entity/LichSuBienDongNhanKhau.java

package com.quanlynhankhau.api.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import com.fasterxml.jackson.annotation.JsonBackReference;

/**
 * Entity lưu lịch sử biến động của nhân khẩu
 * Bao gồm: thêm mới, chuyển đi, qua đời, thay đổi thông tin
 */
@Entity
@Table(name = "lich_su_bien_dong_nhan_khau")
@Getter
@Setter
public class LichSuBienDongNhanKhau {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Loại biến động:
     * - THEM_MOI: Thêm nhân khẩu mới (sinh con, nhập khẩu từ nơi khác)
     * - CHUYEN_DI: Nhân khẩu chuyển đi nơi khác
     * - QUA_DOI: Nhân khẩu qua đời
     * - THAY_DOI_CHU_HO: Thay đổi vai trò thành/không còn là chủ hộ
     * - THAY_DOI_THONG_TIN: Cập nhật thông tin cá nhân
     */
    @Column(name = "loai_bien_dong", nullable = false, length = 50)
    private String loaiBienDong;

    /**
     * Ngày xảy ra biến động
     */
    @Column(name = "ngay_bien_dong", nullable = false)
    private LocalDate ngayBienDong;

    /**
     * Nơi chuyển đến (áp dụng cho loại CHUYEN_DI)
     */
    @Column(name = "noi_chuyen_den")
    private String noiChuyenDen;

    /**
     * Lý do biến động (tùy chọn)
     */
    @Column(name = "ly_do", columnDefinition = "TEXT")
    private String lyDo;

    /**
     * Ghi chú thêm
     * Ví dụ: "Đã qua đời", "Chuyển đi vì công tác", v.v.
     */
    @Column(name = "ghi_chu", columnDefinition = "TEXT")
    private String ghiChu;

    /**
     * Người ghi nhận biến động (thường là tổ trưởng hoặc admin)
     */
    @Column(name = "nguoi_ghi_nhan")
    private String nguoiGhiNhan;

    /**
     * Thời điểm ghi nhận vào hệ thống
     */
    @Column(name = "ngay_ghi_nhan")
    private LocalDateTime ngayGhiNhan;

    /**
     * Quan hệ Many-to-One với NhanKhau
     * Một nhân khẩu có thể có nhiều lịch sử biến động
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nhan_khau_id", nullable = false)
    @JsonBackReference("nhankhau-lichsubiendo")
    private NhanKhau nhanKhau;

    /**
     * Tự động set thời điểm ghi nhận khi tạo mới
     */
    @PrePersist
    protected void onCreate() {
        if (ngayGhiNhan == null) {
            ngayGhiNhan = LocalDateTime.now();
        }
    }
}