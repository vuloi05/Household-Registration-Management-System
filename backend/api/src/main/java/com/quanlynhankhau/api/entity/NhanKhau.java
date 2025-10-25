// src/main/java/com/quanlynhankhau/api/entity/NhanKhau.java

package com.quanlynhankhau.api.entity;

import java.time.LocalDate;
// <<<< THAY ĐỔI 1: Xóa import JsonIgnore và thêm import JsonBackReference >>>>
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "nhan_khau")
@Getter
@Setter
public class NhanKhau {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String hoTen;
    private String biDanh;
    private LocalDate ngaySinh;
    private String gioiTinh; // Giới tính: Nam, Nữ
    private String noiSinh;
    private String queQuan;
    private String danToc;
    private String ngheNghiep;
    private String noiLamViec;

    @Column(unique = true) // Số CCCD phải là duy nhất
    private String cmndCccd;

    private LocalDate ngayCap;
    private String noiCap;

    private LocalDate ngayDangKyThuongTru;
    private String diaChiTruocKhiChuyenDen;

    private String quanHeVoiChuHo;

    // --- MỐI QUAN HỆ MANY-TO-ONE ---
    /**
     * @JsonBackReference: Đánh dấu đây là "phía con" của mối quan hệ.
     * Khi chuyển sang JSON, trường này sẽ bị bỏ qua để phá vỡ vòng lặp, 
     * nhưng mối quan hệ vẫn được duy trì ở phía "cha" (HoKhau).
     */
    // <<<< THAY ĐỔI 2: Thay @JsonIgnore bằng @JsonBackReference >>>>
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ho_khau_id") // Tên cột khóa ngoại trong bảng nhan_khau
    @JsonBackReference("nhanKhau-hoKhau")
    private HoKhau hoKhau;
}