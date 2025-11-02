// src/main/java/com/quanlynhankhau/api/dto/ThayDoiChuHoRequest.java

package com.quanlynhankhau.api.dto;

import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO cho request thay đổi chủ hộ
 */
@Getter
@Setter
public class ThayDoiChuHoRequest {
    private Long hoKhauId;
    private Long chuHoCuId;
    private Long chuHoMoiId;
    private LocalDate ngayThayDoi;
    private String lyDo;
}