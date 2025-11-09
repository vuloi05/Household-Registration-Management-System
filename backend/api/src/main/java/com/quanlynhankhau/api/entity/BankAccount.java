package com.quanlynhankhau.api.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "bank_accounts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BankAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId; // Liên kết với User

    @Column(nullable = false)
    private String accountNumber; // Số tài khoản ngân hàng

    @Column(nullable = false)
    private String accountName; // Tên chủ tài khoản

    @Column(nullable = false)
    private String bankName; // Tên ngân hàng

    private String bankCode; // Mã ngân hàng (VD: VCB, TCB, etc.)

    private String branchName; // Tên chi nhánh

    private Boolean isDefault; // Tài khoản mặc định

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (isDefault == null) {
            isDefault = false;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

