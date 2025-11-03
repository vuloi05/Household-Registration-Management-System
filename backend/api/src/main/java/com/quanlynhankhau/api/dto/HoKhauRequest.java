// src/main/java/com/quanlynhankhau/api/dto/HoKhauRequest.java

package com.quanlynhankhau.api.dto;

import com.quanlynhankhau.api.entity.HoKhau;
import com.quanlynhankhau.api.entity.NhanKhau;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HoKhauRequest {

    // Thông tin cho bảng HoKhau
    private HoKhau hoKhauInfo;

    // Thông tin cho bảng NhanKhau (dành cho chủ hộ)
    private NhanKhau chuHoInfo;
}