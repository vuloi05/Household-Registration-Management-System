// src/main/java/com/quanlynhankhau/api/service/BienDongNhanKhauService.java

package com.quanlynhankhau.api.service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.quanlynhankhau.api.dto.BienDongNhanKhauDTO;
import com.quanlynhankhau.api.dto.ThayDoiChuHoRequest;
import com.quanlynhankhau.api.entity.HoKhau;
import com.quanlynhankhau.api.entity.LichSuBienDongNhanKhau;
import com.quanlynhankhau.api.entity.LichSuThayDoiHoKhau;
import com.quanlynhankhau.api.entity.NhanKhau;
import com.quanlynhankhau.api.repository.HoKhauRepository;
import com.quanlynhankhau.api.repository.LichSuBienDongRepository;
import com.quanlynhankhau.api.repository.LichSuThayDoiHoKhauRepository;
import com.quanlynhankhau.api.repository.NhanKhauRepository;

@Service
public class BienDongNhanKhauService {

    @Autowired
    private LichSuBienDongRepository lichSuBienDongRepository;

    @Autowired
    private LichSuThayDoiHoKhauRepository lichSuThayDoiHoKhauRepository;

    @Autowired
    private NhanKhauRepository nhanKhauRepository;

    @Autowired
    private HoKhauRepository hoKhauRepository;

    /**
     * Ghi nhận biến động nhân khẩu (chuyển đi, qua đời, v.v.)
     */
    @Transactional
    public BienDongNhanKhauDTO ghiNhanBienDong(BienDongNhanKhauDTO request, String nguoiGhiNhan) {
        // Tìm nhân khẩu
        NhanKhau nhanKhau = nhanKhauRepository.findById(request.getNhanKhauId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân khẩu với ID: " + request.getNhanKhauId()));

        // Tạo bản ghi lịch sử
        LichSuBienDongNhanKhau lichSu = new LichSuBienDongNhanKhau();
        lichSu.setNhanKhau(nhanKhau);
        lichSu.setLoaiBienDong(request.getLoaiBienDong());
        lichSu.setNgayBienDong(request.getNgayBienDong());
        lichSu.setNoiChuyenDen(request.getNoiChuyenDen());
        lichSu.setLyDo(request.getLyDo());
        lichSu.setGhiChu(request.getGhiChu());
        lichSu.setNguoiGhiNhan(nguoiGhiNhan);

        // Cập nhật trạng thái nhân khẩu
        switch (request.getLoaiBienDong()) {
            case "CHUYEN_DI":
                nhanKhau.setTrangThai("DA_CHUYEN_DI");
                break;
            case "QUA_DOI":
                nhanKhau.setTrangThai("DA_QUA_DOI");
                break;
            case "TAM_VANG":
                nhanKhau.setTrangThai("TAM_VANG");
                break;
            default:
                // Giữ nguyên trạng thái
                break;
        }

        nhanKhauRepository.save(nhanKhau);
        LichSuBienDongNhanKhau saved = lichSuBienDongRepository.save(lichSu);

        return convertToDTO(saved);
    }

    /**
     * Lấy lịch sử biến động của một nhân khẩu
     */
    public List<BienDongNhanKhauDTO> getLichSuByNhanKhauId(Long nhanKhauId) {
        return lichSuBienDongRepository.findByNhanKhauIdOrderByNgayBienDongDesc(nhanKhauId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lấy lịch sử biến động của một hộ khẩu
     */
    public List<BienDongNhanKhauDTO> getLichSuByHoKhauId(Long hoKhauId) {
        return lichSuBienDongRepository.findByHoKhauId(hoKhauId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lấy lịch sử biến động theo khoảng thời gian
     */
    public List<BienDongNhanKhauDTO> getLichSuByKhoangThoiGian(LocalDate tuNgay, LocalDate denNgay) {
        return lichSuBienDongRepository.findByNgayBienDongBetween(tuNgay, denNgay)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Thống kê số lượng biến động theo loại
     */
    public Long thongKeBienDong(String loai, LocalDate tuNgay, LocalDate denNgay) {
        return lichSuBienDongRepository.countByLoaiAndNgayBetween(loai, tuNgay, denNgay);
    }

    /**
     * Thay đổi chủ hộ
     */
    @Transactional
    public void thayDoiChuHo(ThayDoiChuHoRequest request, String nguoiGhiNhan) {
        // Tìm hộ khẩu
        HoKhau hoKhau = hoKhauRepository.findById(request.getHoKhauId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hộ khẩu với ID: " + request.getHoKhauId()));

        // Tìm chủ hộ cũ và mới
        NhanKhau chuHoCu = nhanKhauRepository.findById(request.getChuHoCuId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chủ hộ cũ"));

        NhanKhau chuHoMoi = nhanKhauRepository.findById(request.getChuHoMoiId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chủ hộ mới"));

        // Kiểm tra chủ hộ mới có thuộc hộ khẩu này không
        if (!chuHoMoi.getHoKhau().getId().equals(hoKhau.getId())) {
            throw new RuntimeException("Chủ hộ mới phải là thành viên của hộ khẩu này");
        }

        // Cập nhật quan hệ với chủ hộ
        chuHoCu.setQuanHeVoiChuHo("Thành viên"); // hoặc quan hệ cụ thể khác
        chuHoMoi.setQuanHeVoiChuHo("Chủ hộ");

        // Cập nhật chủ hộ của hộ khẩu
        hoKhau.setChuHo(chuHoMoi);

        // Lưu thay đổi
        nhanKhauRepository.save(chuHoCu);
        nhanKhauRepository.save(chuHoMoi);
        hoKhauRepository.save(hoKhau);

        // Ghi nhận lịch sử thay đổi
        LichSuThayDoiHoKhau lichSu = new LichSuThayDoiHoKhau();
        lichSu.setHoKhau(hoKhau);
        lichSu.setLoaiThayDoi("THAY_DOI_CHU_HO");
        lichSu.setNoiDungThayDoi(
                String.format("Thay đổi chủ hộ từ %s sang %s. Lý do: %s",
                        chuHoCu.getHoTen(), chuHoMoi.getHoTen(), request.getLyDo())
        );
        lichSu.setNgayThayDoi(request.getNgayThayDoi());
        lichSu.setChuHoCu(chuHoCu);
        lichSu.setChuHoMoi(chuHoMoi);
        lichSu.setNguoiGhiNhan(nguoiGhiNhan);

        lichSuThayDoiHoKhauRepository.save(lichSu);
    }

    /**
     * Lấy lịch sử thay đổi của hộ khẩu
     */
    public List<LichSuThayDoiHoKhau> getLichSuThayDoiHoKhau(Long hoKhauId) {
        return lichSuThayDoiHoKhauRepository.findByHoKhauIdOrderByNgayThayDoiDesc(hoKhauId);
    }

    /**
     * Lấy tất cả lịch sử biến động
     */
    public List<BienDongNhanKhauDTO> getAllLichSuBienDong() {
        return lichSuBienDongRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Convert Entity sang DTO
     */
    private BienDongNhanKhauDTO convertToDTO(LichSuBienDongNhanKhau entity) {
        BienDongNhanKhauDTO dto = new BienDongNhanKhauDTO();
        dto.setId(entity.getId());
        dto.setNhanKhauId(entity.getNhanKhau().getId());
        dto.setLoaiBienDong(entity.getLoaiBienDong());
        dto.setNgayBienDong(entity.getNgayBienDong());
        dto.setNoiChuyenDen(entity.getNoiChuyenDen());
        dto.setLyDo(entity.getLyDo());
        dto.setGhiChu(entity.getGhiChu());
        dto.setNguoiGhiNhan(entity.getNguoiGhiNhan());
        dto.setNgayGhiNhan(entity.getNgayGhiNhan());

        // Thông tin nhân khẩu
        dto.setHoTenNhanKhau(entity.getNhanKhau().getHoTen());
        dto.setCmndCccd(entity.getNhanKhau().getCmndCccd());
        if (entity.getNhanKhau().getHoKhau() != null) {
            dto.setMaHoKhau(entity.getNhanKhau().getHoKhau().getMaHoKhau());
        }

        return dto;
    }
}