// src/main/java/com/quanlynhankhau/api/dto/NhanKhauRequestDTO.java

package com.quanlynhankhau.api.dto;

import java.time.LocalDate;

import lombok.Getter;
import lombok.Setter;

/**
 * DTO để nhận dữ liệu từ frontend khi tạo/cập nhật nhân khẩu.
 * Bao gồm cả mã hộ khẩu để có thể tìm hộ khẩu tương ứng.
 */
@Getter
@Setter
public class NhanKhauRequestDTO {
    
    private String hoTen;
    private String biDanh;
    private LocalDate ngaySinh;
    private String gioiTinh;
    private String noiSinh;
    private String queQuan;
    private String danToc;
    private String ngheNghiep;
    private String noiLamViec;
    private String cmndCccd;
    private LocalDate ngayCap;
    private String noiCap;
    private LocalDate ngayDangKyThuongTru;
    private String diaChiTruocKhiChuyenDen;
    private String quanHeVoiChuHo;
    
    // Mã hộ khẩu để tìm hộ khẩu tương ứng
    private String maHoKhau;
}
