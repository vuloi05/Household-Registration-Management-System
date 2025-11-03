// src/main/java/com/quanlynhankhau/api/dto/ThongKeKhoanThuDTO.java
package com.quanlynhankhau.api.dto;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ThongKeKhoanThuDTO {
    private long soHoDaNop;
    private long tongSoHo;
    private BigDecimal tongSoTien;
}