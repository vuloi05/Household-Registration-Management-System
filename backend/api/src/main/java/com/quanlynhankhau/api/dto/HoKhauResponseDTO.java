// src/main/java/com/quanlynhankhau/api/dto/HoKhauResponseDTO.java
package com.quanlynhankhau.api.dto;

import java.time.LocalDate;
import java.util.List; // Thêm import cho List
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class HoKhauResponseDTO {
    private Long id;
    private String maHoKhau;
    private String diaChi;
    private LocalDate ngayLap;
    private NhanKhauBasicDTO chuHo; // Chủ hộ giờ là một DTO đơn giản
    private List<NhanKhauBasicDTO> thanhVien; // Thêm danh sách thành viên
}