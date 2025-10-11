// src/main/java/com/quanlynhankhau/api/service/LichSuNopTienService.java

package com.quanlynhankhau.api.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.quanlynhankhau.api.dto.NopTienRequestDTO;
import com.quanlynhankhau.api.entity.HoKhau;
import com.quanlynhankhau.api.entity.KhoanThu;
import com.quanlynhankhau.api.entity.LichSuNopTien;
import com.quanlynhankhau.api.repository.HoKhauRepository;
import com.quanlynhankhau.api.repository.KhoanThuRepository;
import com.quanlynhankhau.api.repository.LichSuNopTienRepository;

@Service
public class LichSuNopTienService {

    @Autowired
    private LichSuNopTienRepository lichSuNopTienRepository;

    @Autowired
    private HoKhauRepository hoKhauRepository;

    @Autowired
    private KhoanThuRepository khoanThuRepository;

    /**
     * Ghi nhận một lần nộp tiền của hộ khẩu cho một khoản thu.
     * @param request DTO chứa thông tin về lần nộp tiền.
     * @return Bản ghi Lịch sử nộp tiền đã được lưu.
     */
    public LichSuNopTien ghiNhanNopTien(NopTienRequestDTO request) {
        // 1. Tìm Hộ khẩu dựa trên hoKhauId từ request. Nếu không thấy, báo lỗi.
        HoKhau hoKhau = hoKhauRepository.findById(request.getHoKhauId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hộ khẩu với ID: " + request.getHoKhauId()));

        // 2. Tìm Khoản thu dựa trên khoanThuId từ request. Nếu không thấy, báo lỗi.
        KhoanThu khoanThu = khoanThuRepository.findById(request.getKhoanThuId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khoản thu với ID: " + request.getKhoanThuId()));

        // 3. Tạo một đối tượng LichSuNopTien mới
        LichSuNopTien newRecord = new LichSuNopTien();
        newRecord.setHoKhau(hoKhau);
        newRecord.setKhoanThu(khoanThu);
        newRecord.setNgayNop(request.getNgayNop());
        newRecord.setSoTien(request.getSoTien());
        newRecord.setNguoiThu(request.getNguoiThu());

        // 4. Lưu bản ghi mới vào CSDL và trả về
        return lichSuNopTienRepository.save(newRecord);
    }

    // Các phương thức thống kê sẽ được thêm ở đây sau
}