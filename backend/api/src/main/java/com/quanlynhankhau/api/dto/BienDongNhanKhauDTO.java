// src/main/java/com/quanlynhankhau/api/dto/BienDongNhanKhauDTO.java

package com.quanlynhankhau.api.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

/**
 * DTO cho request tạo biến động nhân khẩu từ frontend
 */
@Getter
@Setter
public class BienDongNhanKhauDTO {
    private Long nhanKhauId;
    private String loaiBienDong;
    private LocalDate ngayBienDong;
    private String noiChuyenDen;
    private String lyDo;
    private String ghiChu;

    public void setId(Long id) {
    }

    public void setNguoiGhiNhan(String nguoiGhiNhan) {
    }

    public void setNgayGhiNhan(LocalDateTime ngayGhiNhan) {
    }

    public void setHoTenNhanKhau(String hoTen) {
    }

    public void setCmndCccd(String cmndCccd) {
    }

    public void setMaHoKhau(String maHoKhau) {
    }
}