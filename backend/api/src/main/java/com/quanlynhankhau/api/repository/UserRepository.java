// src/main/java/com/quanlynhankhau/api/repository/UserRepository.java

package com.quanlynhankhau.api.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.quanlynhankhau.api.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
    // Spring Data JPA sẽ tự tạo câu lệnh để tìm User theo username
    Optional<User> findByUsername(String username);
}