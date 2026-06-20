package com.trosmart.backend.repository;

import com.trosmart.backend.entity.Notification;
import com.trosmart.backend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    /**
     * Lấy tất cả notification của user, mới nhất trước, có phân trang.
     */
    Page<Notification> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);

    /**
     * Đếm notification chưa đọc (dùng cho badge trên bell icon).
     */
    long countByUserAndReadFalse(User user);

    /**
     * Đánh dấu tất cả notification của user là đã đọc.
     */
    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.user = :user AND n.read = false")
    int markAllAsRead(@Param("user") User user);
}
