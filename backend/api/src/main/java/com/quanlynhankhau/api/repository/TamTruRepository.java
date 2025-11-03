// src/main/java/com/quanlynhankhau/api/repository/TamTruRepository.java

package com.quanlynhankhau.api.repository;

import com.quanlynhankhau.api.entity.TamTru;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TamTruRepository extends JpaRepository<TamTru, Long> {
}
