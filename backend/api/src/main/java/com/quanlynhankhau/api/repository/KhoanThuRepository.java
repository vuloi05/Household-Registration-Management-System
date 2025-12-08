package com.quanlynhankhau.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.quanlynhankhau.api.entity.KhoanThu;

@Repository
public interface KhoanThuRepository extends JpaRepository<KhoanThu, Long> {
    // Spring Data JPA sẽ tự động cung cấp các phương thức CRUD cơ bản.
    // Chúng ta không cần viết thêm gì ở đây cho các chức năng ban đầu.
}