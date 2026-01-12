// src/main/java/com/quanlynhankhau/api/service/LichSuNopTienService.java

package com.quanlynhankhau.api.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.quanlynhankhau.api.dto.HoKhauResponseDTO;
import com.quanlynhankhau.api.dto.LichSuNopTienResponseDTO;
import com.quanlynhankhau.api.dto.NhanKhauBasicDTO;
import com.quanlynhankhau.api.dto.NopTienRequestDTO;
import com.quanlynhankhau.api.dto.ThongKeKhoanThuDTO;
import com.quanlynhankhau.api.entity.HoKhau;
import com.quanlynhankhau.api.entity.KhoanThu;
import com.quanlynhankhau.api.entity.LichSuNopTien;
import com.quanlynhankhau.api.entity.Payment;
import com.quanlynhankhau.api.repository.HoKhauRepository;
import com.quanlynhankhau.api.repository.KhoanThuRepository;
import com.quanlynhankhau.api.repository.LichSuNopTienRepository;

import jakarta.transaction.Transactional;

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
    @Transactional
    public LichSuNopTien ghiNhanNopTien(NopTienRequestDTO request) {
        // 1. Tìm Hộ khẩu trong CSDL bằng id. Nếu không tìm thấy, ném ra một ngoại lệ.
        HoKhau hoKhau = hoKhauRepository.findById(request.getHoKhauId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hộ khẩu với ID: " + request.getHoKhauId()));

        // 2. Tìm Khoản thu trong CSDL bằng id.
        KhoanThu khoanThu = khoanThuRepository.findById(request.getKhoanThuId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khoản thu với ID: " + request.getKhoanThuId()));

        // 3. Tạo một đối tượng Entity LichSuNopTien mới từ thông tin trong request DTO.
        LichSuNopTien newRecord = new LichSuNopTien();
        newRecord.setHoKhau(hoKhau); // Gán đối tượng Hộ khẩu đầy đủ
        newRecord.setKhoanThu(khoanThu); // Gán đối tượng Khoản thu đầy đủ
        newRecord.setNgayNop(request.getNgayNop());
        newRecord.setSoTien(request.getSoTien());
        newRecord.setNguoiThu(request.getNguoiThu());

        // 4. Lưu đối tượng mới vào CSDL và trả về.
        return lichSuNopTienRepository.save(newRecord);
    }

    /**
     * Ghi nhận một lần nộp tiền từ một giao dịch Payment đã thành công.
     * @param payment Giao dịch Payment đã được xác nhận là 'PAID'.
     * @return Bản ghi Lịch sử nộp tiền đã được lưu.
     */
    @Transactional
    public LichSuNopTien ghiNhanNopTienTuPayment(Payment payment) {
        if (!"PAID".equalsIgnoreCase(payment.getStatus())) {
            // Chỉ ghi nhận nếu payment đã PAID, nếu không thì không làm gì cả
            return null;
        }

        HoKhau hoKhau = hoKhauRepository.findById(payment.getHoKhauId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hộ khẩu với ID: " + payment.getHoKhauId()));
        KhoanThu khoanThu = khoanThuRepository.findById(payment.getKhoanThuId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khoản thu với ID: " + payment.getKhoanThuId()));

        // Tạo một bản ghi mới trong lịch sử nộp tiền
        LichSuNopTien newRecord = new LichSuNopTien();
        newRecord.setHoKhau(hoKhau);
        newRecord.setKhoanThu(khoanThu);
        newRecord.setNgayNop(payment.getPaidAt().toLocalDate());
        newRecord.setSoTien(payment.getAmount());
        newRecord.setNguoiThu("PayOS Webhook"); // Đánh dấu là thanh toán qua PayOS

        return lichSuNopTienRepository.save(newRecord);
    }
    
    /**
     * Phương thức private giúp chuyển đổi một LichSuNopTien Entity sang LichSuNopTienResponseDTO.
     * Mục đích là để trả về cho client một cấu trúc dữ liệu sạch, chứa đủ thông tin cần thiết
     * mà không làm lộ cấu trúc CSDL và tránh các lỗi Lazy Loading.
     */
    private LichSuNopTienResponseDTO convertToDTO(LichSuNopTien entity) {
        LichSuNopTienResponseDTO dto = new LichSuNopTienResponseDTO();
        dto.setId(entity.getId());
        dto.setNgayNop(entity.getNgayNop());
        dto.setSoTien(entity.getSoTien());
        dto.setNguoiThu(entity.getNguoiThu());

        // Chuyển đổi thông tin Hộ khẩu từ Entity lồng nhau sang DTO
        if (entity.getHoKhau() != null) {
            HoKhauResponseDTO hoKhauDTO = new HoKhauResponseDTO();
            hoKhauDTO.setId(entity.getHoKhau().getId());
            hoKhauDTO.setMaHoKhau(entity.getHoKhau().getMaHoKhau());
            hoKhauDTO.setDiaChi(entity.getHoKhau().getDiaChi());
            
            // Chuyển đổi thông tin Chủ hộ từ Entity sang DTO cơ bản
            if (entity.getHoKhau().getChuHo() != null) {
                NhanKhauBasicDTO chuHoDTO = new NhanKhauBasicDTO();
                chuHoDTO.setId(entity.getHoKhau().getChuHo().getId());
                chuHoDTO.setHoTen(entity.getHoKhau().getChuHo().getHoTen());
                hoKhauDTO.setChuHo(chuHoDTO);
            }
            dto.setHoKhau(hoKhauDTO);
        }
        return dto;
    }

    /**
     * Lấy tất cả lịch sử nộp tiền cho một khoản thu cụ thể và trả về dưới dạng DTO.
     */
    public List<LichSuNopTienResponseDTO> getLichSuByKhoanThuId(Long khoanThuId) {
        // 1. Tìm tất cả các Entity LichSuNopTien theo khoanThuId.
        // 2. Dùng Stream API để duyệt qua từng Entity và áp dụng hàm convertToDTO.
        // 3. Thu thập kết quả thành một List các DTO.
        return lichSuNopTienRepository.findByKhoanThuId(khoanThuId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Tính toán các số liệu thống kê cho một khoản thu.
     */
    public ThongKeKhoanThuDTO getThongKeKhoanThu(Long khoanThuId) {
        // Lấy tất cả các bản ghi nộp tiền liên quan đến khoản thu này
        List<LichSuNopTien> danhSachNopTien = lichSuNopTienRepository.findByKhoanThuId(khoanThuId);
        
        // Đếm số hộ đã nộp bằng cách lấy ID của các hộ khẩu, loại bỏ các ID trùng lặp, rồi đếm
        long soHoDaNop = danhSachNopTien.stream()
                                    .map(record -> record.getHoKhau().getId())
                                    .distinct()
                                    .count();
        
        // Đếm tổng số hộ khẩu trong hệ thống để so sánh
        long tongSoHo = hoKhauRepository.count();
        
        // Tính tổng số tiền đã thu bằng cách lấy ra trường 'soTien' của mỗi bản ghi và cộng chúng lại
        BigDecimal tongSoTien = danhSachNopTien.stream()
                                            .map(LichSuNopTien::getSoTien)
                                            .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Trả về một DTO chứa tất cả các thông tin đã tính toán
        return new ThongKeKhoanThuDTO(soHoDaNop, tongSoHo, tongSoTien);
    }

}