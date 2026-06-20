package com.trosmart.backend.repository;

import com.trosmart.backend.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    // Tìm các bài đăng đang hoạt động công khai
    List<Post> findByStatus(String status);

    Optional<Post> findByRoomId(Long roomId);

    // Tự động ẩn tin đăng khi hợp đồng được ký (Chuyển status thành 'hidden') - (UR-L02)
    @Modifying
    @Query("UPDATE Post p SET p.status = 'hidden' WHERE p.roomId = :roomId")
    int hidePostByRoomId(@Param("roomId") Long roomId);
}