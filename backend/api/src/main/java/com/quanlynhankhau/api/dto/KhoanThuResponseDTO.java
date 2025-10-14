// src/main/java/com/quanlynhankhau/api/dto/KhoanThuResponseDTO.java
package com.quanlynhankhau.api.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class KhoanThuResponseDTO {
    private Long id;
    private String tenKhoanThu;
    private LocalDate ngayTao;
    private String loaiKhoanThu;
    private BigDecimal soTienTrenMotNhanKhau;
}