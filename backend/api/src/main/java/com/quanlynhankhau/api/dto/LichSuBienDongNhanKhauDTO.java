package com.quanlynhankhau.api.dto;

import com.quanlynhankhau.api.entity.LichSuBienDongNhanKhau;

import java.time.LocalDate;

public class LichSuBienDongNhanKhauDTO {

    private Long id;
    private String loaiBienDong;
    private LocalDate ngayBienDong;
    private String ghiChu;
    private String nguoiGhiNhan;

    public LichSuBienDongNhanKhauDTO() {
    }

    public LichSuBienDongNhanKhauDTO(LichSuBienDongNhanKhau entity) {
        this.id = entity.getId();
        this.loaiBienDong = entity.getLoaiBienDong();
        this.ngayBienDong = entity.getNgayBienDong();
        this.ghiChu = entity.getGhiChu();
        this.nguoiGhiNhan = entity.getNguoiGhiNhan();
    }


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getLoaiBienDong() {
        return loaiBienDong;
    }

    public void setLoaiBienDong(String loaiBienDong) {
        this.loaiBienDong = loaiBienDong;
    }

    public LocalDate getNgayBienDong() {
        return ngayBienDong;
    }

    public void setNgayBienDong(LocalDate ngayBienDong) {
        this.ngayBienDong = ngayBienDong;
    }

    public String getGhiChu() {
        return ghiChu;
    }

    public void setGhiChu(String ghiChu) {
        this.ghiChu = ghiChu;
    }

    public String getNguoiGhiNhan() {
        return nguoiGhiNhan;
    }

    public void setNguoiGhiNhan(String nguoiGhiNhan) {
        this.nguoiGhiNhan = nguoiGhiNhan;
    }
}
