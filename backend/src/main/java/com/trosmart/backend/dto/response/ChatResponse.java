package com.trosmart.backend.dto.response;

import com.trosmart.backend.entity.Conversation;
import com.trosmart.backend.entity.Message;
import com.trosmart.backend.entity.Notification;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class ChatResponse {

    // ── Conversation ─────────────────────────────────────────
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ConversationDto {
        private Long conversationId;
        private ParticipantDto userA;
        private ParticipantDto userB;
        private Long postId;
        private String postTitle;
        private LocalDateTime lastMessageAt;
        private LocalDateTime createdAt;
        private long unreadCount;   // tin chưa đọc của currentUser

        public static ConversationDto from(Conversation c, long unread) {
            return ConversationDto.builder()
                    .conversationId(c.getConversationId())
                    .userA(ParticipantDto.from(c.getUserA()))
                    .userB(ParticipantDto.from(c.getUserB()))
                    .postId(c.getPost() != null ? c.getPost().getPostId() : null)
                    .postTitle(c.getPost() != null ? c.getPost().getTitle() : null)
                    .lastMessageAt(c.getLastMessageAt())
                    .createdAt(c.getCreatedAt())
                    .unreadCount(unread)
                    .build();
        }
    }

    // ── Participant (user hiển thị trong conversation) ────────
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ParticipantDto {
        private Long userId;
        private String fullName;
        private String avatarUrl;

        public static ParticipantDto from(com.trosmart.backend.entity.User u) {
            return ParticipantDto.builder()
                    .userId(u.getUserId())
                    .fullName(u.getFullName())
                    .avatarUrl(u.getAvatarUrl())
                    .build();
        }
    }

    // ── Message ───────────────────────────────────────────────
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class MessageDto {
        private Long messageId;
        private Long conversationId;
        private Long senderId;
        private String senderName;
        private String senderAvatar;
        private String content;
        private LocalDateTime sentAt;
        private boolean read;
        private LocalDateTime readAt;

        public static MessageDto from(Message m) {
            return MessageDto.builder()
                    .messageId(m.getMessageId())
                    .conversationId(m.getConversation().getConversationId())
                    .senderId(m.getSender().getUserId())
                    .senderName(m.getSender().getFullName())
                    .senderAvatar(m.getSender().getAvatarUrl())
                    .content(m.getContent())
                    .sentAt(m.getSentAt())
                    .read(m.isRead())
                    .readAt(m.getReadAt())
                    .build();
        }
    }

    // ── Notification ──────────────────────────────────────────
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class NotificationDto {
        private Long notificationId;
        private String type;
        private String refTable;
        private Long refId;
        private String title;
        private String body;
        private boolean read;
        private LocalDateTime createdAt;

        public static NotificationDto from(Notification n) {
            return NotificationDto.builder()
                    .notificationId(n.getNotificationId())
                    .type(n.getType().name())
                    .refTable(n.getRefTable())
                    .refId(n.getRefId())
                    .title(n.getTitle())
                    .body(n.getBody())
                    .read(n.isRead())
                    .createdAt(n.getCreatedAt())
                    .build();
        }
    }

    // ── Unread count summary ───────────────────────────────────
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class UnreadSummary {
        private long unreadMessages;
        private long unreadNotifications;
    }
}
