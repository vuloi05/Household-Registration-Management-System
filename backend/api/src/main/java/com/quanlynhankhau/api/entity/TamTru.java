// src/main/java/com/quanlynhankhau/api/entity/TamTru.java

package com.quanlynhankhau.api.entity;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "tam_tru")
@Getter
@Setter
public class TamTru {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ho_ten", nullable = false)
    private String hoTen;

    @Column(name = "ngay_sinh")
    private LocalDate ngaySinh;

    @Column(name = "gioi_tinh", length = 10)
    private String gioiTinh;

    @Column(name = "cmnd_cccd")
    private String cmndCccd;

    @Column(name = "noi_thuong_tru")
    private String noiThuongTru;

    @ManyToOne
    @JoinColumn(name = "ho_khau_tiep_nhan_id")
    private HoKhau hoKhauTiepNhan;

    @Column(name = "ngay_bat_dau", nullable = false)
    private LocalDate ngayBatDau;

    @Column(name = "ngay_ket_thuc", nullable = false)
    private LocalDate ngayKetThuc;

    @Column(name = "ly_do", columnDefinition = "TEXT")
    private String lyDo;

    @Column(name = "ngay_cap")
    private LocalDate ngayCap;

    @Column(name = "nguoi_cap")
    private String nguoiCap;
}
