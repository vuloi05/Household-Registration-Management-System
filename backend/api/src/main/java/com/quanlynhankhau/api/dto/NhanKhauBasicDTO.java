package com.quanlynhankhau.api.dto;

import java.time.LocalDate;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class NhanKhauBasicDTO {
    private Long id;
    private String hoTen;
    private LocalDate ngaySinh;
    private String quanHeVoiChuHo;
}