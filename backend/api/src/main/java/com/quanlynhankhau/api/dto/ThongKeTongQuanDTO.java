// src/main/java/com/quanlynhankhau/api/dto/ThongKeTongQuanDTO.java
package com.quanlynhankhau.api.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor // Tạo constructor với tất cả các tham số
public class ThongKeTongQuanDTO {
    private long soHoKhau;
    private long soNhanKhau;
    // Tạm thời chưa có nghiệp vụ Tạm trú, sẽ để giá trị mặc định
    private long soTamTru; 
}