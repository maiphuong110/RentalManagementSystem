package com.trosmart.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

public class ChatRequest {

    /**
     * Tạo conversation mới hoặc lấy conversation đã tồn tại.
     * POST /api/v1/conversations
     */
    @Data
    public static class CreateConversation {

        @NotNull(message = "receiverId không được để trống")
        private Long receiverId;

        // nullable — không bắt buộc phải gắn với post
        private Long postId;
    }

    /**
     * Gửi tin nhắn.
     * POST /api/v1/conversations/{id}/messages
     */
    @Data
    public static class SendMessage {

        @NotBlank(message = "Nội dung tin nhắn không được để trống")
        @Size(max = 1000, message = "Tin nhắn tối đa 1000 ký tự")
        private String content;
    }
}
