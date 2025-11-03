// src/main/java/com/quanlynhankhau/api/service/ThongKeService.java

package com.quanlynhankhau.api.service;

import java.time.LocalDate;
import java.time.Period;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.quanlynhankhau.api.dto.ThongKeTongQuanDTO;
import com.quanlynhankhau.api.entity.NhanKhau;
import com.quanlynhankhau.api.repository.HoKhauRepository;
import com.quanlynhankhau.api.repository.NhanKhauRepository;

@Service
public class ThongKeService {

    @Autowired
    private HoKhauRepository hoKhauRepository;

    @Autowired
    private NhanKhauRepository nhanKhauRepository;

    public ThongKeTongQuanDTO getThongKeTongQuan() {
        long soHoKhau = hoKhauRepository.count();
        long soNhanKhau = nhanKhauRepository.count();
        long soTamTru = 0; // Tạm thời
        return new ThongKeTongQuanDTO(soHoKhau, soNhanKhau, soTamTru);
    }

    public Map<String, Long> getThongKeTheoDoTuoi() {
        List<NhanKhau> allNhanKhau = nhanKhauRepository.findAll();
        LocalDate today = LocalDate.now();

        // Sử dụng Stream API để nhóm và đếm
        Map<String, Long> thongKe = allNhanKhau.stream()
                .filter(nk -> nk.getNgaySinh() != null)
                .collect(Collectors.groupingBy(
                        nk -> getNhomTuoi(Period.between(nk.getNgaySinh(), today).getYears()),
                        Collectors.counting()
                ));
        
        // Sắp xếp lại Map để có thứ tự hợp lý
        Map<String, Long> sortedThongKe = new LinkedHashMap<>();
        sortedThongKe.put("0-5", thongKe.getOrDefault("0-5", 0L));
        sortedThongKe.put("6-10", thongKe.getOrDefault("6-10", 0L));
        sortedThongKe.put("11-14", thongKe.getOrDefault("11-14", 0L));
        sortedThongKe.put("15-17", thongKe.getOrDefault("15-17", 0L));
        sortedThongKe.put("18-60", thongKe.getOrDefault("18-60", 0L));
        sortedThongKe.put(">60", thongKe.getOrDefault(">60", 0L));

        return sortedThongKe;
    }

    // Hàm helper để phân loại nhóm tuổi
    private String getNhomTuoi(int tuoi) {
        if (tuoi <= 5) return "0-5";
        if (tuoi <= 10) return "6-10";
        if (tuoi <= 14) return "11-14";
        if (tuoi <= 17) return "15-17";
        if (tuoi <= 60) return "18-60";
        return ">60";
    }

    public Map<String, Long> getThongKeTheoGioiTinh() {
        return nhanKhauRepository.findAll().stream()
                .collect(Collectors.groupingBy(NhanKhau::getGioiTinh, Collectors.counting()));
    }
    
    // (Chúng ta sẽ thêm thống kê Giới tính sau khi cập nhật CSDL)
}