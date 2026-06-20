package com.trosmart.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "Notification")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Notification {

    public enum Type {
        bill_due, contract_expiry, new_message, payment_received
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notification_id")
    private Long notificationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private Type type;

    // Tên bảng liên quan: "Monthly_Bill", "Contracts", "Conversation"...
    @Column(name = "ref_table", length = 50)
    private String refTable;

    // ID của bản ghi liên quan trong ref_table
    @Column(name = "ref_id")
    private Long refId;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "body", length = 500)
    private String body;

    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private boolean read = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
