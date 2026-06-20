package com.trosmart.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "Conversation")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Conversation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "conversation_id")
    private Long conversationId;

    /**
     * user_a LUÔN là MIN(userA_id, userB_id)
     * user_b LUÔN là MAX(userA_id, userB_id)
     * Enforce ở Service, không để Controller tự set
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_a", nullable = false)
    private User userA;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_b", nullable = false)
    private User userB;

    // nullable — conversation có thể không liên quan đến post nào
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id")
    private Post post;

    @Column(name = "last_message_at")
    private LocalDateTime lastMessageAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
