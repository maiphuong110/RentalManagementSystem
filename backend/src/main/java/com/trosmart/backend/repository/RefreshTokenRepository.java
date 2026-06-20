package com.trosmart.backend.repository;

import com.trosmart.backend.entity.RefreshToken;
import com.trosmart.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByTokenHash(String tokenHash);

    // Thu hồi toàn bộ refresh token của user (dùng khi logout all devices)
    @Modifying
    @Query("UPDATE RefreshToken rt SET rt.revoked = true WHERE rt.user = :user AND rt.revoked = false")
    void revokeAllByUser(@Param("user") User user);

    // Xóa token hết hạn định kỳ (có thể gọi từ scheduler)
    @Modifying
    @Query("DELETE FROM RefreshToken rt WHERE rt.expiresAt < CURRENT_TIMESTAMP OR rt.revoked = true")
    void deleteExpiredAndRevoked();
}
