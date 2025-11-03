// src/main/java/com/quanlynhankhau/api/service/TamVangTamTruService.java

package com.quanlynhankhau.api.service;

import com.quanlynhankhau.api.dto.TamTruDTO;
import com.quanlynhankhau.api.dto.TamVangDTO;
import com.quanlynhankhau.api.entity.TamVang;
import com.quanlynhankhau.api.entity.TamTru;
import com.quanlynhankhau.api.repository.TamVangRepository;
import com.quanlynhankhau.api.repository.TamTruRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TamVangTamTruService {

    @Autowired
    private TamVangRepository tamVangRepository;

    @Autowired
    private TamTruRepository tamTruRepository;

    public List<TamVangDTO> getAllTamVang() {
        return tamVangRepository.findAll().stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public TamVang createTamVang(TamVang tamVang) {
        return tamVangRepository.save(tamVang);
    }

    public List<TamTruDTO> getAllTamTru() {
        return tamTruRepository.findAll().stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public TamTru createTamTru(TamTru tamTru) {
        return tamTruRepository.save(tamTru);
    }

    public long countTamVang() {
        return tamVangRepository.count();
    }

    public long countTamTru() {
        return tamTruRepository.count();
    }

    private TamVangDTO convertToDTO(TamVang tamVang) {
        TamVangDTO dto = new TamVangDTO();
        dto.setId(tamVang.getId());
        if (tamVang.getNhanKhau() != null) {
            dto.setNhanKhauId(tamVang.getNhanKhau().getId());
            dto.setNhanKhauHoTen(tamVang.getNhanKhau().getHoTen());
        }
        dto.setNgayBatDau(tamVang.getNgayBatDau());
        dto.setNgayKetThuc(tamVang.getNgayKetThuc());
        dto.setNoiDen(tamVang.getNoiDen());
        dto.setLyDo(tamVang.getLyDo());
        return dto;
    }

    private TamTruDTO convertToDTO(TamTru tamTru) {
        TamTruDTO dto = new TamTruDTO();
        dto.setId(tamTru.getId());
        dto.setHoTen(tamTru.getHoTen());
        dto.setNgaySinh(tamTru.getNgaySinh());
        dto.setGioiTinh(tamTru.getGioiTinh());
        dto.setCmndCccd(tamTru.getCmndCccd());
        dto.setNoiThuongTru(tamTru.getNoiThuongTru());
        if (tamTru.getHoKhauTiepNhan() != null) {
            dto.setHoKhauTiepNhanId(tamTru.getHoKhauTiepNhan().getId());
            dto.setHoKhauTiepNhanMaHoKhau(tamTru.getHoKhauTiepNhan().getMaHoKhau());
        }
        dto.setNgayBatDau(tamTru.getNgayBatDau());
        dto.setNgayKetThuc(tamTru.getNgayKetThuc());
        dto.setLyDo(tamTru.getLyDo());
        return dto;
    }
}
