package com.trosmart.backend.repository;

import com.trosmart.backend.entity.Conversation;
import com.trosmart.backend.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MessageRepository extends JpaRepository<Message, Long> {

    /**
     * Lấy tin nhắn theo conversation, sắp xếp cũ → mới, có phân trang.
     */
    Page<Message> findByConversationOrderBySentAtAsc(Conversation conversation, Pageable pageable);

    /**
     * Đánh dấu đã đọc tất cả tin nhắn trong conversation mà người đọc KHÔNG phải sender.
     * Gọi khi user mở conversation.
     */
    @Modifying
    @Query("""
        UPDATE Message m SET m.read = true, m.readAt = CURRENT_TIMESTAMP
        WHERE m.conversation = :conversation
          AND m.sender.userId <> :readerId
          AND m.read = false
    """)
    int markAllAsRead(
            @Param("conversation") Conversation conversation,
            @Param("readerId") Long readerId);

    /**
     * Đếm tin nhắn chưa đọc của 1 user trong 1 conversation.
     */
    @Query("""
        SELECT COUNT(m) FROM Message m
        WHERE m.conversation = :conversation
          AND m.sender.userId <> :userId
          AND m.read = false
    """)
    long countUnread(
            @Param("conversation") Conversation conversation,
            @Param("userId") Long userId);

    /**
     * Tổng tin nhắn chưa đọc của user trên toàn bộ conversation.
     */
    @Query("""
        SELECT COUNT(m) FROM Message m
        JOIN m.conversation c
        WHERE (c.userA.userId = :userId OR c.userB.userId = :userId)
          AND m.sender.userId <> :userId
          AND m.read = false
    """)
    long countTotalUnread(@Param("userId") Long userId);
}
