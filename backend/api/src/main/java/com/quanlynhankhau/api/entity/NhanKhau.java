package com.quanlynhankhau.api.entity;

import java.time.LocalDate;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "nhan_khau")
@Data
@NoArgsConstructor
@AllArgsConstructor
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

    /**
     * Trạng thái của nhân khẩu:
     * - DANG_CU_TRU: Đang cư trú tại hộ khẩu này
     * - DA_CHUYEN_DI: Đã chuyển đi nơi khác
     * - DA_QUA_DOI: Đã qua đời
     * - TAM_VANG: Đang tạm vắng
     */
    @Column(name = "trang_thai", length = 50)
    private String trangThai = "DANG_CU_TRU"; // Giá trị mặc định

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


    /**
     * Quan hệ One-to-Many với LichSuBienDongNhanKhau
     * Một nhân khẩu có thể có nhiều lịch sử biến động
     */
    @OneToMany(mappedBy = "nhanKhau", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("nhankhau-lichsubiendo")
    private List<LichSuBienDongNhanKhau> danhSachBienDong;

}