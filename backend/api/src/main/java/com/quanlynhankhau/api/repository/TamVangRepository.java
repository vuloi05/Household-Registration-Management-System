// src/main/java/com/quanlynhankhau/api/repository/TamVangRepository.java

package com.quanlynhankhau.api.repository;

import com.quanlynhankhau.api.entity.TamVang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TamVangRepository extends JpaRepository<TamVang, Long> {
}
