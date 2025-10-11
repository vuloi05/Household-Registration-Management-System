// src/main/java/com/quanlynhankhau/api/dto/ThongKeTheoDoTuoiDTO.java
package com.quanlynhankhau.api.dto;

import lombok.Getter;
import lombok.Setter;
import java.util.Map;

@Getter
@Setter
public class ThongKeTheoDoTuoiDTO {
    // Sử dụng Map để lưu trữ linh hoạt: "Tên nhóm tuổi" -> Số lượng
    private Map<String, Long> soLuongTheoNhomTuoi;
}