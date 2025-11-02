// src/main/java/com/quanlynhankhau/api/entity/LichSuThayDoiHoKhau.java

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
 * Entity lưu lịch sử thay đổi của hộ khẩu
 * Bao gồm: thay đổi chủ hộ, thay đổi địa chỉ, tách hộ
 */
@Entity
@Table(name = "lich_su_thay_doi_ho_khau")
@Getter
@Setter
public class LichSuThayDoiHoKhau {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Loại thay đổi:
     * - THAY_DOI_CHU_HO: Thay đổi chủ hộ
     * - THAY_DOI_DIA_CHI: Thay đổi địa chỉ
     * - TACH_HO: Tách hộ từ hộ hiện tại
     */
    @Column(name = "loai_thay_doi", nullable = false, length = 50)
    private String loaiThayDoi;

    /**
     * Mô tả chi tiết nội dung thay đổi
     */
    @Column(name = "noi_dung_thay_doi", nullable = false, columnDefinition = "TEXT")
    private String noiDungThayDoi;

    /**
     * Ngày thực hiện thay đổi
     */
    @Column(name = "ngay_thay_doi", nullable = false)
    private LocalDate ngayThayDoi;

    /**
     * Chủ hộ cũ (áp dụng cho loại THAY_DOI_CHU_HO)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chu_ho_cu_id")
    @JsonBackReference("chuhocu-lichsu")
    private NhanKhau chuHoCu;

    /**
     * Chủ hộ mới (áp dụng cho loại THAY_DOI_CHU_HO)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chu_ho_moi_id")
    @JsonBackReference("chuhomoi-lichsu")
    private NhanKhau chuHoMoi;

    /**
     * Người ghi nhận thay đổi
     */
    @Column(name = "nguoi_ghi_nhan")
    private String nguoiGhiNhan;

    /**
     * Thời điểm ghi nhận vào hệ thống
     */
    @Column(name = "ngay_ghi_nhan")
    private LocalDateTime ngayGhiNhan;

    /**
     * Quan hệ Many-to-One với HoKhau
     * Một hộ khẩu có thể có nhiều lịch sử thay đổi
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ho_khau_id", nullable = false)
    @JsonBackReference("hokhau-lichsuthaydoi")
    private HoKhau hoKhau;

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