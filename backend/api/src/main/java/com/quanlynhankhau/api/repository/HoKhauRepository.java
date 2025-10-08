// src/main/java/com/quanlynhankhau/api/repository/HoKhauRepository.java

package com.quanlynhankhau.api.repository;

import com.quanlynhankhau.api.entity.HoKhau;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository // Đánh dấu đây là một Spring Bean thuộc tầng Repository
public interface HoKhauRepository extends JpaRepository<HoKhau, Long> {
    // Để trống!
    // Spring Data JPA sẽ tự động tạo các phương thức CRUD cho chúng ta.
    // Ví dụ: save(), findById(), findAll(), deleteById(), ...
}