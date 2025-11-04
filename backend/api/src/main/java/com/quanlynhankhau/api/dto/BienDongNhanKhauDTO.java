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
    private Long id;
    private Long nhanKhauId;
    private String hoTenNhanKhau;
    private String cmndCccd;
    private String maHoKhau;
    private String loaiBienDong;
    private LocalDate ngayBienDong;
    private String noiChuyenDen;
    private String lyDo;
    private String ghiChu;
    private String nguoiGhiNhan;
    private LocalDateTime ngayGhiNhan;
}