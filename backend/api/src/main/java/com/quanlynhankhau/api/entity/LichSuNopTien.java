// src/main/java/com/quanlynhankhau/api/entity/LichSuNopTien.java

package com.quanlynhankhau.api.entity;

import java.math.BigDecimal;
import java.time.LocalDate;

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

import com.fasterxml.jackson.annotation.JsonBackReference; 

@Entity
@Table(name = "lich_su_nop_tien")
@Getter
@Setter
public class LichSuNopTien {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate ngayNop;

    private BigDecimal soTien;
    
    private String nguoiThu;

    // Mối quan hệ: Nhiều Lịch sử nộp tiền thuộc về Một Khoản thu
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "khoan_thu_id")
    @JsonBackReference("lichsu-khoanthu") // Thêm tên để phân biệt các back reference
    private KhoanThu khoanThu;

    // Mối quan hệ: Nhiều Lịch sử nộp tiền thuộc về Một Hộ khẩu
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ho_khau_id")
    @JsonBackReference("lichsu-hokhau") // Thêm tên để phân biệt các back reference
    private HoKhau hoKhau;
}