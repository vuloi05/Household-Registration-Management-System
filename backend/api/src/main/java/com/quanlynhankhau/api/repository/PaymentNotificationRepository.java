package com.quanlynhankhau.api.repository;

import com.quanlynhankhau.api.entity.PaymentNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentNotificationRepository extends JpaRepository<PaymentNotification, Long> {
    List<PaymentNotification> findAllByOrderByCreatedAtDesc();
    
    long countByDaXemFalse();
    
    @Modifying
    @Query("UPDATE PaymentNotification p SET p.daXem = true WHERE p.daXem = false")
    void markAllAsRead();
}

