// src/main/java/com/quanlynhankhau/api/dto/NhanKhauDTO.java

package com.quanlynhankhau.api.dto;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO để trả về thông tin nhân khẩu kèm theo thông tin hộ khẩu.
 * Tránh vòng lặp JSON khi serialize.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class NhanKhauDTO {
    private Long id;
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
    private String quanHeVoiChuHo;
    
    // Thông tin hộ khẩu (không phải toàn bộ entity)
    private Long hoKhauId;
    private String maHoKhau;
    private String diaChiHoKhau;
}
