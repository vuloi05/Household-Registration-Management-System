// src/main/java/com/quanlynhankhau/api/service/TamVangTamTruService.java

package com.quanlynhankhau.api.service;

import com.quanlynhankhau.api.entity.TamVang;
import com.quanlynhankhau.api.entity.TamTru;
import com.quanlynhankhau.api.repository.TamVangRepository;
import com.quanlynhankhau.api.repository.TamTruRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TamVangTamTruService {

    @Autowired
    private TamVangRepository tamVangRepository;

    @Autowired
    private TamTruRepository tamTruRepository;

    public List<TamVang> getAllTamVang() {
        return tamVangRepository.findAll();
    }

    public TamVang createTamVang(TamVang tamVang) {
        return tamVangRepository.save(tamVang);
    }

    public List<TamTru> getAllTamTru() {
        return tamTruRepository.findAll();
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
}
