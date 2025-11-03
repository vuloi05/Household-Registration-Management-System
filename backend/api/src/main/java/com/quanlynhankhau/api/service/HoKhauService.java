// src/main/java/com/quanlynhankhau/api/service/HoKhauService.java
package com.quanlynhankhau.api.service;

import com.quanlynhankhau.api.dto.HoKhauLichSuDTO;
import com.quanlynhankhau.api.entity.LichSuBienDongNhanKhau;
import com.quanlynhankhau.api.entity.LichSuThayDoiHoKhau;
import com.quanlynhankhau.api.repository.LichSuBienDongRepository;
import com.quanlynhankhau.api.repository.LichSuThayDoiHoKhauRepository;

import java.util.ArrayList;
import java.util.stream.Stream;

import com.quanlynhankhau.api.dto.HoKhauRequest;
import com.quanlynhankhau.api.dto.HoKhauResponseDTO; 
import com.quanlynhankhau.api.dto.NhanKhauBasicDTO;  
import com.quanlynhankhau.api.entity.HoKhau;
import com.quanlynhankhau.api.entity.NhanKhau;
import com.quanlynhankhau.api.repository.HoKhauRepository;
import com.quanlynhankhau.api.repository.NhanKhauRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors; //Import Collectors để dùng Stream API

@Service
public class HoKhauService {

    @Autowired
    private HoKhauRepository hoKhauRepository;

    @Autowired
    private NhanKhauRepository nhanKhauRepository;

    @Autowired
    private LichSuThayDoiHoKhauRepository lichSuThayDoiHoKhauRepository;

    @Autowired
    private LichSuBienDongRepository lichSuBienDongRepository;

    public List<HoKhauLichSuDTO> getLichSuTongHopByHoKhauId(Long hoKhauId) {
        // Lấy lịch sử thay đổi của chính hộ khẩu (thay đổi chủ hộ, địa chỉ...)
        List<LichSuThayDoiHoKhau> thayDoiHoKhauList = lichSuThayDoiHoKhauRepository.findByHoKhauIdOrderByNgayThayDoiDesc(hoKhauId);

        // Lấy lịch sử biến động của các thành viên trong hộ (chuyển đi, chuyển đến, mất...)
        List<LichSuBienDongNhanKhau> bienDongThanhVienList = lichSuBienDongRepository.findByHoKhauId(hoKhauId);

        // Chuyển đổi danh sách 1 sang DTO chung
        Stream<HoKhauLichSuDTO> stream1 = thayDoiHoKhauList.stream().map(ls -> {
            String noiDung = ls.getNoiDungThayDoi();
            return new HoKhauLichSuDTO(ls.getNgayThayDoi(), ls.getLoaiThayDoi(), noiDung, ls.getNguoiGhiNhan());
        });

        // Chuyển đổi danh sách 2 sang DTO chung
        Stream<HoKhauLichSuDTO> stream2 = bienDongThanhVienList.stream()
            // Chỉ lấy các biến động liên quan đến thành viên
            .filter(ls -> List.of("THEM_MOI", "CHUYEN_DI", "KHAI_TU", "TACH_KHAU").contains(ls.getLoaiBienDong()))
            .map(ls -> {
                String tenNhanKhau = ls.getNhanKhau() != null ? ls.getNhanKhau().getHoTen() : "Không rõ";
                String noiDung = String.format("Thành viên %s: %s", tenNhanKhau, ls.getGhiChu());
                return new HoKhauLichSuDTO(ls.getNgayBienDong(), "THANH_VIEN: " + ls.getLoaiBienDong(), noiDung, ls.getNguoiGhiNhan());
            });

        // Gộp 2 stream lại và sắp xếp
        List<HoKhauLichSuDTO> combinedList = Stream.concat(stream1, stream2)
                .sorted(HoKhauLichSuDTO.getComparator())
                .collect(Collectors.toList());

        return combinedList;
    }


    //Phương thức private để chuyển đổi Entity sang DTO
    /**
     * Chuyển đổi một đối tượng HoKhau (Entity) sang HoKhauResponseDTO.
     * DTO chỉ chứa những thông tin cần thiết cho frontend, giúp che giấu cấu trúc CSDL
     * và giải quyết các vấn đề liên quan đến Lazy Loading.
     * @param hoKhau Đối tượng Entity cần chuyển đổi.
     * @return Một đối tượng DTO đã được chuyển đổi.
     */
    private HoKhauResponseDTO convertToDTO(HoKhau hoKhau) {
        if (hoKhau == null) {
            return null;
        }

        HoKhauResponseDTO dto = new HoKhauResponseDTO();
        dto.setId(hoKhau.getId());
        dto.setMaHoKhau(hoKhau.getMaHoKhau());
        dto.setDiaChi(hoKhau.getDiaChi());
        dto.setNgayLap(hoKhau.getNgayLap());

        // Chuyển đổi thông tin chủ hộ từ Entity NhanKhau sang DTO NhanKhauBasicDTO
        if (hoKhau.getChuHo() != null) {
            NhanKhauBasicDTO chuHoDTO = new NhanKhauBasicDTO();
            chuHoDTO.setId(hoKhau.getChuHo().getId());
            chuHoDTO.setHoTen(hoKhau.getChuHo().getHoTen());
            dto.setChuHo(chuHoDTO);
        }

        return dto;
    }


    //Sửa kiểu trả về của các phương thức public >>>

    // Phương thức để lấy tất cả hộ khẩu, giờ trả về một List các DTO
    public List<HoKhauResponseDTO> getAllHoKhau() {
        return hoKhauRepository.findAll().stream()
                .map(this::convertToDTO) // Dùng Stream API để áp dụng hàm convertToDTO cho mỗi hộ khẩu
                .collect(Collectors.toList());
    }

    // Phương thức để lấy một hộ khẩu theo ID, giờ trả về một DTO
    public HoKhauResponseDTO getHoKhauById(Long id) {
        HoKhau hoKhau = hoKhauRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hộ khẩu với id: " + id));
        return convertToDTO(hoKhau); // Chuyển đổi entity sang DTO trước khi trả về
    }

    // phương thức createHoKhau, giờ trả về một DTO
    @Transactional
    public HoKhauResponseDTO createHoKhau(HoKhauRequest request) {
        // Logic bên trong để lưu vào CSDL vẫn giữ nguyên
        HoKhau hoKhau = request.getHoKhauInfo();
        NhanKhau chuHo = request.getChuHoInfo();

        hoKhau.setChuHo(null);
        HoKhau savedHoKhau = hoKhauRepository.save(hoKhau);

        chuHo.setHoKhau(savedHoKhau);
        chuHo.setQuanHeVoiChuHo("Chủ hộ");
        NhanKhau savedChuHo = nhanKhauRepository.save(chuHo);
        
        savedHoKhau.setChuHo(savedChuHo);
        HoKhau finalHoKhau = hoKhauRepository.save(savedHoKhau);

        // Chuyển đổi entity cuối cùng sang DTO trước khi trả về
        return convertToDTO(finalHoKhau);
    }

    // Phương thức tách hộ - chuyển nhân khẩu hiện có sang hộ khẩu mới
    public HoKhauResponseDTO separateHousehold(HoKhauRequest request, String cmndCccd) {
        // Tìm nhân khẩu hiện có
        NhanKhau existingPerson = nhanKhauRepository.findByCmndCccd(cmndCccd)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân khẩu với CCCD: " + cmndCccd));

        // Tạo hộ khẩu mới
        HoKhau hoKhau = new HoKhau();
        hoKhau.setMaHoKhau(request.getHoKhauInfo().getMaHoKhau());
        hoKhau.setDiaChi(request.getHoKhauInfo().getDiaChi());
        hoKhau.setNgayLap(request.getHoKhauInfo().getNgayLap());
        hoKhau.setChuHo(null);
        
        HoKhau savedHoKhau = hoKhauRepository.save(hoKhau);

        // Chuyển nhân khẩu sang hộ khẩu mới và cập nhật thông tin
        existingPerson.setHoKhau(savedHoKhau);
        existingPerson.setQuanHeVoiChuHo("Chủ hộ");
        
        // Cập nhật thông tin từ form nếu có
        if (request.getChuHoInfo() != null) {
            existingPerson.setHoTen(request.getChuHoInfo().getHoTen());
            existingPerson.setNgaySinh(request.getChuHoInfo().getNgaySinh());
        }
        
        NhanKhau savedChuHo = nhanKhauRepository.save(existingPerson);
        
        // Cập nhật chủ hộ cho hộ khẩu mới
        savedHoKhau.setChuHo(savedChuHo);
        HoKhau finalHoKhau = hoKhauRepository.save(savedHoKhau);

        return convertToDTO(finalHoKhau);
    }

    // phương thức updateHoKhau, giờ trả về một DTO
    public HoKhauResponseDTO updateHoKhau(Long id, HoKhau hoKhauDetails) {
        HoKhau existingHoKhau = hoKhauRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hộ khẩu với id: " + id));

        existingHoKhau.setMaHoKhau(hoKhauDetails.getMaHoKhau());
        existingHoKhau.setDiaChi(hoKhauDetails.getDiaChi());
        existingHoKhau.setNgayLap(hoKhauDetails.getNgayLap());

        HoKhau updatedHoKhau = hoKhauRepository.save(existingHoKhau);
        
        // Chuyển đổi entity đã cập nhật sang DTO trước khi trả về
        return convertToDTO(updatedHoKhau);
    }

    // Phương thức xóa một hộ khẩu (giữ nguyên, vì nó không trả về gì)
    public void deleteHoKhau(Long id) {
        if (!hoKhauRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy hộ khẩu với id: " + id);
        }
        hoKhauRepository.deleteById(id);
    }
}