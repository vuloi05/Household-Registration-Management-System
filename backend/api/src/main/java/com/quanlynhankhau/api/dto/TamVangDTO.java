// d:\Household-Registration-Management-System\backend\api\src\main\java\com\quanlynhankhau\api\dto\TamVangDTO.java
package com.quanlynhankhau.api.dto;

import java.time.LocalDate;

public class TamVangDTO {
    private Long id;
    private Long nhanKhauId;
    private String nhanKhauHoTen; // Optional: to display name on frontend
    private LocalDate ngayBatDau;
    private LocalDate ngayKetThuc;
    private String noiDen;
    private String lyDo;

    // Constructors
    public TamVangDTO() {
    }

    public TamVangDTO(Long id, Long nhanKhauId, String nhanKhauHoTen, LocalDate ngayBatDau, LocalDate ngayKetThuc, String noiDen, String lyDo) {
        this.id = id;
        this.nhanKhauId = nhanKhauId;
        this.nhanKhauHoTen = nhanKhauHoTen;
        this.ngayBatDau = ngayBatDau;
        this.ngayKetThuc = ngayKetThuc;
        this.noiDen = noiDen;
        this.lyDo = lyDo;
    }


    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getNhanKhauId() {
        return nhanKhauId;
    }

    public void setNhanKhauId(Long nhanKhauId) {
        this.nhanKhauId = nhanKhauId;
    }

    public String getNhanKhauHoTen() {
        return nhanKhauHoTen;
    }

    public void setNhanKhauHoTen(String nhanKhauHoTen) {
        this.nhanKhauHoTen = nhanKhauHoTen;
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

    public String getNoiDen() {
        return noiDen;
    }

    public void setNoiDen(String noiDen) {
        this.noiDen = noiDen;
    }

    public String getLyDo() {
        return lyDo;
    }

    public void setLyDo(String lyDo) {
        this.lyDo = lyDo;
    }
}
