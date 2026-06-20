package com.trosmart.backend.repository;

import com.trosmart.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    // Chỉ tìm user chưa bị soft-delete
    @Query("SELECT u FROM User u WHERE u.email = :email AND u.deletedAt IS NULL")
    Optional<User> findActiveByEmail(@Param("email") String email);

    @Query("SELECT u FROM User u WHERE u.phone = :phone AND u.deletedAt IS NULL")
    Optional<User> findActiveByPhone(@Param("phone") String phone);

    @Query("SELECT u FROM User u WHERE u.cccdNumber = :cccd AND u.deletedAt IS NULL")
    Optional<User> findActiveByCccd(@Param("cccd") String cccd);

    @Query("SELECT COUNT(u) > 0 FROM User u WHERE u.email = :email AND u.deletedAt IS NULL")
    boolean existsActiveByEmail(@Param("email") String email);

    @Query("SELECT COUNT(u) > 0 FROM User u WHERE u.phone = :phone AND u.deletedAt IS NULL")
    boolean existsActiveByPhone(@Param("phone") String phone);

    // Lấy user bao gồm đã xóa (dùng cho admin)
    Optional<User> findById(Long id);

    // Lấy user active theo id (dùng cho JWT filter)
    @Query("SELECT u FROM User u WHERE u.userId = :id AND u.deletedAt IS NULL")
    Optional<User> findActiveById(@Param("id") Long id);
}
