// src/main/java/com/quanlynhankhau/api/dto/LichSuNopTienResponseDTO.java
package com.quanlynhankhau.api.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LichSuNopTienResponseDTO {
    private Long id;
    private LocalDate ngayNop;
    private BigDecimal soTien;
    private String nguoiThu;
    
    // Thay vì chỉ có ID, chúng ta sẽ có cả object HoKhau chi tiết
    private HoKhauResponseDTO hoKhau; 
}