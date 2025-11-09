package com.quanlynhankhau.api.repository;

import com.quanlynhankhau.api.entity.BankAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BankAccountRepository extends JpaRepository<BankAccount, Long> {
    List<BankAccount> findByUserId(Long userId);
    Optional<BankAccount> findByUserIdAndIsDefaultTrue(Long userId);
    Optional<BankAccount> findByUserIdAndAccountNumber(Long userId, String accountNumber);
}

