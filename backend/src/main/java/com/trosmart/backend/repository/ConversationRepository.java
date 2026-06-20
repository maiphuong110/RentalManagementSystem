package com.trosmart.backend.repository;

import com.trosmart.backend.entity.Conversation;
import com.trosmart.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    /**
     * Tìm conversation đã tồn tại giữa 2 user cho 1 post cụ thể.
     */
    @Query("""
        SELECT c FROM Conversation c
        WHERE c.userA.userId = :userAId AND c.userB.userId = :userBId
          AND c.post.postId = :postId
    """)
    Optional<Conversation> findByUsersAndPost(
            @Param("userAId") Long userAId,
            @Param("userBId") Long userBId,
            @Param("postId") Long postId);

    /**
     * Tìm conversation không liên quan post (general chat).
     */
    @Query("""
        SELECT c FROM Conversation c
        WHERE c.userA.userId = :userAId AND c.userB.userId = :userBId
          AND c.post IS NULL
    """)
    List<Conversation> findByUsersNoPost(
            @Param("userAId") Long userAId,
            @Param("userBId") Long userBId);

    /**
     * Tìm bất kỳ conversation nào giữa 2 user.
     */
    @Query("""
        SELECT c FROM Conversation c
        WHERE c.userA = :userA AND c.userB = :userB
    """)
    List<Conversation> findByUsers(
            @Param("userA") User userA,
            @Param("userB") User userB);

    /**
     * Lấy tất cả conversation của 1 user (cả 2 chiều user_a và user_b),
     * sắp xếp theo tin nhắn mới nhất.
     */
    @Query("""
        SELECT c FROM Conversation c
        WHERE c.userA = :user OR c.userB = :user
        ORDER BY c.lastMessageAt DESC NULLS LAST
    """)
    List<Conversation> findAllByUser(@Param("user") User user);
}
