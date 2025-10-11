// src/main/java/com/quanlynhankhau/api/entity/KhoanThu.java

package com.quanlynhankhau.api.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
@Table(name = "khoan_thu")
@Getter
@Setter
public class KhoanThu {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String tenKhoanThu;

    private LocalDate ngayTao;

    private String loaiKhoanThu; // 'BAT_BUOC' hoặc 'DONG_GOP'

    private BigDecimal soTienTrenMotNhanKhau;

    // Mối quan hệ: Một Khoản thu có nhiều Lịch sử nộp tiền
    @OneToMany(mappedBy = "khoanThu", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore // Tránh vòng lặp khi serialize ??????
    @JsonManagedReference("lichsu-khoanthu")
    private List<LichSuNopTien> danhSachNopTien;
}