package com.quanlynhankhau.api.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Setter
@Getter
public class TamTruDTO {
    private Long id;
    private String hoTen;
    private LocalDate ngaySinh;
    private String gioiTinh;
    private String cmndCccd;
    private String noiThuongTru;
    private Long hoKhauTiepNhanId;
    private String hoKhauTiepNhanMaHoKhau; // Optional
    private LocalDate ngayBatDau;
    private LocalDate ngayKetThuc;
    private String lyDo;

    // Constructors
    public TamTruDTO() {
    }

    public TamTruDTO(Long id, String hoTen, LocalDate ngaySinh, String gioiTinh, String cmndCccd, String noiThuongTru, Long hoKhauTiepNhanId, String hoKhauTiepNhanMaHoKhau, LocalDate ngayBatDau, LocalDate ngayKetThuc, String lyDo) {
        this.id = id;
        this.hoTen = hoTen;
        this.ngaySinh = ngaySinh;
        this.gioiTinh = gioiTinh;
        this.cmndCccd = cmndCccd;
        this.noiThuongTru = noiThuongTru;
        this.hoKhauTiepNhanId = hoKhauTiepNhanId;
        this.hoKhauTiepNhanMaHoKhau = hoKhauTiepNhanMaHoKhau;
        this.ngayBatDau = ngayBatDau;
        this.ngayKetThuc = ngayKetThuc;
        this.lyDo = lyDo;
    }

    // Getters and Setters

}
