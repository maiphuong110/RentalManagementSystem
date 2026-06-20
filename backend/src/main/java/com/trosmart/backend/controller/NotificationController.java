package com.trosmart.backend.controller;

import com.trosmart.backend.dto.response.ApiResponse;
import com.trosmart.backend.dto.response.ChatResponse.*;
import com.trosmart.backend.entity.User;
import com.trosmart.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * GET /api/v1/notifications?page=0&size=20
     * Lấy danh sách notification của user, mới nhất trước.
     */
    @GetMapping
    public ApiResponse<Page<NotificationDto>> getMyNotifications(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(notificationService.getMyNotifications(currentUser, page, size));
    }

    /**
     * GET /api/v1/notifications/unread-count
     * Đếm notification chưa đọc (dùng cho bell icon badge).
     */
    @GetMapping("/unread-count")
    public ApiResponse<Long> getUnreadCount(@AuthenticationPrincipal User currentUser) {
        return ApiResponse.ok(notificationService.countUnread(currentUser));
    }

    /**
     * PUT /api/v1/notifications/{id}/read
     * Đánh dấu 1 notification là đã đọc.
     */
    @PutMapping("/{id}/read")
    public ApiResponse<NotificationDto> markAsRead(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long id) {
        return ApiResponse.ok("Đã đánh dấu đã đọc",
                notificationService.markAsRead(currentUser, id));
    }

    /**
     * PUT /api/v1/notifications/read-all
     * Đánh dấu tất cả notification là đã đọc.
     */
    @PutMapping("/read-all")
    public ApiResponse<Void> markAllAsRead(@AuthenticationPrincipal User currentUser) {
        int count = notificationService.markAllAsRead(currentUser);
        return ApiResponse.ok("Đã đánh dấu " + count + " thông báo là đã đọc");
    }
}
