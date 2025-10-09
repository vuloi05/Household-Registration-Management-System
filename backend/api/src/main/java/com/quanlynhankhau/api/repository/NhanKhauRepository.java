// src/main/java/com/quanlynhankhau/api/repository/NhanKhauRepository.java

package com.quanlynhankhau.api.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.quanlynhankhau.api.entity.NhanKhau;

@Repository
public interface NhanKhauRepository extends JpaRepository<NhanKhau, Long> {

    // --- Phương thức truy vấn tùy chỉnh ---
    // Spring Data JPA sẽ tự động hiểu và tạo ra câu lệnh SQL
    // để tìm tất cả các NhanKhau có trường 'hoKhau' với id khớp với id truyền vào.
    List<NhanKhau> findByHoKhauId(Long hoKhauId);
}