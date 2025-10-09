// src/main/java/com/quanlynhankhau/api/entity/HoKhau.java

package com.quanlynhankhau.api.entity;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore; // Import JsonIgnore

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity // Đánh dấu đây là một Entity, sẽ được ánh xạ tới một bảng trong CSDL
@Table(name = "ho_khau") // Tên của bảng trong CSDL
@Getter // Tự động tạo các hàm getter cho tất cả các trường (nhờ Lombok)
@Setter // Tự động tạo các hàm setter cho tất cả các trường (nhờ Lombok)
public class HoKhau {

    @Id // Đánh dấu đây là khóa chính
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Khóa chính sẽ tự động tăng
    private Long id;

    private String maHoKhau;

    private String chuHo;

    private String diaChi;

    // Constructors, ... (Lombok sẽ tự tạo, chúng ta không cần viết)

    
    // --- MỐI QUAN HỆ ONE-TO-MANY ---
    // Một Hộ khẩu sẽ có Nhiều Nhân khẩu.
    @OneToMany(mappedBy = "hoKhau", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore // Ngăn không cho trường này bị serialize thành JSON để tránh vòng lặp vô hạn
    private List<NhanKhau> danhSachNhanKhau;

}