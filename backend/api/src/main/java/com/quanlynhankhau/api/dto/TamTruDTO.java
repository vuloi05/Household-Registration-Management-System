// d:\Household-Registration-Management-System\backend\api\src\main\java\com\quanlynhankhau\api\dto\TamTruDTO.java
package com.quanlynhankhau.api.dto;

import java.time.LocalDate;

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

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getHoTen() {
        return hoTen;
    }

    public void setHoTen(String hoTen) {
        this.hoTen = hoTen;
    }

    public LocalDate getNgaySinh() {
        return ngaySinh;
    }

    public void setNgaySinh(LocalDate ngaySinh) {
        this.ngaySinh = ngaySinh;
    }

    public String getGioiTinh() {
        return gioiTinh;
    }

    public void setGioiTinh(String gioiTinh) {
        this.gioiTinh = gioiTinh;
    }

    public String getCmndCccd() {
        return cmndCccd;
    }

    public void setCmndCccd(String cmndCccd) {
        this.cmndCccd = cmndCccd;
    }

    public String getNoiThuongTru() {
        return noiThuongTru;
    }

    public void setNoiThuongTru(String noiThuongTru) {
        this.noiThuongTru = noiThuongTru;
    }

    public Long getHoKhauTiepNhanId() {
        return hoKhauTiepNhanId;
    }

    public void setHoKhauTiepNhanId(Long hoKhauTiepNhanId) {
        this.hoKhauTiepNhanId = hoKhauTiepNhanId;
    }

    public String getHoKhauTiepNhanMaHoKhau() {
        return hoKhauTiepNhanMaHoKhau;
    }

    public void setHoKhauTiepNhanMaHoKhau(String hoKhauTiepNhanMaHoKhau) {
        this.hoKhauTiepNhanMaHoKhau = hoKhauTiepNhanMaHoKhau;
    }

    public LocalDate getNgayBatDau() {
        return ngayBatDau;
    }

    public void setNgayBatDau(LocalDate ngayBatDau) {
        this.ngayBatDau = ngayBatDau;
    }

    public LocalDate getNgayKetThuc() {
        return ngayKetThuc;
    }

    public void setNgayKetThuc(LocalDate ngayKetThuc) {
        this.ngayKetThuc = ngayKetThuc;
    }

    public String getLyDo() {
        return lyDo;
    }

    public void setLyDo(String lyDo) {
        this.lyDo = lyDo;
    }
}
