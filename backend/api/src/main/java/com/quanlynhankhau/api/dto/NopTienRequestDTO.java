// src/main/java/com/quanlynhankhau/api/dto/NopTienRequestDTO.java

package com.quanlynhankhau.api.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NopTienRequestDTO {

    // ID của hộ khẩu đã nộp tiền
    private Long hoKhauId;

    // ID của khoản thu mà hộ khẩu này nộp
    private Long khoanThuId;

    // Ngày nộp tiền
    private LocalDate ngayNop;

    // Số tiền đã nộp
    private BigDecimal soTien;

    // Tên của người thu tiền (ví dụ: tên của kế toán đang đăng nhập)
    private String nguoiThu;
}