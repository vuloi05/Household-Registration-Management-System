// src/main/java/com/quanlynhankhau/api/controller/TamVangTamTruController.java

package com.quanlynhankhau.api.controller;

import com.quanlynhankhau.api.entity.TamVang;
import com.quanlynhankhau.api.entity.TamTru;
import com.quanlynhankhau.api.service.TamVangTamTruService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tam-vang-tam-tru")
@CrossOrigin(origins = "http://localhost:5173")
public class TamVangTamTruController {

    @Autowired
    private TamVangTamTruService tamVangTamTruService;

    @GetMapping("/tam-vang")
    public ResponseEntity<List<TamVang>> getAllTamVang() {
        return ResponseEntity.ok(tamVangTamTruService.getAllTamVang());
    }

    @PostMapping("/tam-vang")
    public ResponseEntity<TamVang> createTamVang(@RequestBody TamVang tamVang) {
        return ResponseEntity.ok(tamVangTamTruService.createTamVang(tamVang));
    }

    @GetMapping("/tam-tru")
    public ResponseEntity<List<TamTru>> getAllTamTru() {
        return ResponseEntity.ok(tamVangTamTruService.getAllTamTru());
    }

    @PostMapping("/tam-tru")
    public ResponseEntity<TamTru> createTamTru(@RequestBody TamTru tamTru) {
        return ResponseEntity.ok(tamVangTamTruService.createTamTru(tamTru));
    }

    @GetMapping("/tam-vang/count")
    public ResponseEntity<Long> countTamVang() {
        return ResponseEntity.ok(tamVangTamTruService.countTamVang());
    }

    @GetMapping("/tam-tru/count")
    public ResponseEntity<Long> countTamTru() {
        return ResponseEntity.ok(tamVangTamTruService.countTamTru());
    }
}
