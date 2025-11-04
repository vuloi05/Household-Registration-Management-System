package com.quanlynhankhau.api.dto;

import java.time.LocalDate;
import java.util.Comparator;

public class HoKhauLichSuDTO {

    private LocalDate ngayThayDoi;
    private String loaiThayDoi;
    private String noiDung;
    private String nguoiThucHien;

    public HoKhauLichSuDTO(LocalDate ngayThayDoi, String loaiThayDoi, String noiDung, String nguoiThucHien) {
        this.ngayThayDoi = ngayThayDoi;
        this.loaiThayDoi = loaiThayDoi;
        this.noiDung = noiDung;
        this.nguoiThucHien = nguoiThucHien;
    }

    public LocalDate getNgayThayDoi() {
        return ngayThayDoi;
    }

    public void setNgayThayDoi(LocalDate ngayThayDoi) {
        this.ngayThayDoi = ngayThayDoi;
    }

    public String getLoaiThayDoi() {
        return loaiThayDoi;
    }

    public void setLoaiThayDoi(String loaiThayDoi) {
        this.loaiThayDoi = loaiThayDoi;
    }

    public String getNoiDung() {
        return noiDung;
    }

    public void setNoiDung(String noiDung) {
        this.noiDung = noiDung;
    }

    public String getNguoiThucHien() {
        return nguoiThucHien;
    }

    public void setNguoiThucHien(String nguoiThucHien) {
        this.nguoiThucHien = nguoiThucHien;
    }

    public static Comparator<HoKhauLichSuDTO> getComparator() {
        return Comparator.comparing(HoKhauLichSuDTO::getNgayThayDoi).reversed();
    }
}
