package com.trosmart.backend.controller;

import com.trosmart.backend.dto.request.ChatRequest.*;
import com.trosmart.backend.dto.response.ApiResponse;
import com.trosmart.backend.dto.response.ChatResponse.*;
import com.trosmart.backend.entity.User;
import com.trosmart.backend.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/conversations")
@RequiredArgsConstructor
public class ConversationController {

    private final ChatService chatService;

    /**
     * POST /api/v1/conversations
     * Tạo conversation mới hoặc lấy conversation đã tồn tại.
     * Body: { receiverId, postId? }
     */
    @PostMapping
    @ResponseStatus(HttpStatus.OK)
    public ApiResponse<ConversationDto> getOrCreate(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody CreateConversation req) {
        try {
            return ApiResponse.ok(chatService.getOrCreate(currentUser, req));
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            // Nếu có lỗi trùng lặp do concurrent request, retry một lần để lấy cuộc hội thoại đã được transaction kia tạo/cập nhật
            return ApiResponse.ok(chatService.getOrCreate(currentUser, req));
        }
    }

    /**
     * GET /api/v1/conversations
     * Lấy danh sách conversation của user hiện tại.
     * Sắp xếp theo tin nhắn mới nhất.
     */
    @GetMapping
    public ApiResponse<List<ConversationDto>> getMyConversations(
            @AuthenticationPrincipal User currentUser) {
        return ApiResponse.ok(chatService.getMyConversations(currentUser));
    }

    /**
     * GET /api/v1/conversations/{id}
     * Lấy chi tiết 1 conversation.
     */
    @GetMapping("/{id}")
    public ApiResponse<ConversationDto> getOne(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long id) {
        return ApiResponse.ok(chatService.getOne(currentUser, id));
    }

    /**
     * GET /api/v1/conversations/{id}/messages?page=0&size=20
     * Lấy tin nhắn trong conversation (phân trang).
     * Tự động đánh dấu đã đọc khi gọi.
     */
    @GetMapping("/{id}/messages")
    public ApiResponse<Page<MessageDto>> getMessages(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(chatService.getMessages(currentUser, id, page, size));
    }

    /**
     * POST /api/v1/conversations/{id}/messages
     * Gửi tin nhắn vào conversation.
     * Body: { content }
     */
    @PostMapping("/{id}/messages")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<MessageDto> sendMessage(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long id,
            @Valid @RequestBody SendMessage req) {
        return ApiResponse.ok("Đã gửi tin nhắn", chatService.sendMessage(currentUser, id, req));
    }

    /**
     * GET /api/v1/conversations/unread-count
     * Tổng tin nhắn chưa đọc (dùng cho badge).
     */
    @GetMapping("/unread-count")
    public ApiResponse<Long> getUnreadCount(@AuthenticationPrincipal User currentUser) {
        return ApiResponse.ok(chatService.getTotalUnread(currentUser));
    }
}
