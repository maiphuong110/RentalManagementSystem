package com.trosmart.backend.controller;

import com.trosmart.backend.dto.request.UpdateProfileRequest;
import com.trosmart.backend.dto.response.ApiResponse;
import com.trosmart.backend.dto.response.UserResponse;
import com.trosmart.backend.entity.User;
import com.trosmart.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * GET /api/v1/users/me
     * Lấy thông tin profile của user đang đăng nhập
     */
    @GetMapping("/me")
    public ApiResponse<UserResponse> getProfile(@AuthenticationPrincipal User currentUser) {
        return ApiResponse.ok(userService.getProfile(currentUser));
    }

    /**
     * PUT /api/v1/users/me
     * Cập nhật fullName, phone, cccdNumber
     * Body: { fullName?, phone?, cccdNumber? }
     */
    @PutMapping("/me")
    public ApiResponse<UserResponse> updateProfile(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody UpdateProfileRequest req) {
        return ApiResponse.ok("Cập nhật thành công", userService.updateProfile(currentUser, req));
    }

    /**
     * POST /api/v1/users/me/avatar
     * Upload ảnh đại diện
     * Form-data: file (image/*)
     */
    @PostMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<UserResponse> uploadAvatar(
            @AuthenticationPrincipal User currentUser,
            @RequestParam("file") MultipartFile file) throws IOException {
        return ApiResponse.ok("Upload avatar thành công", userService.uploadAvatar(currentUser, file));
    }

    /**
     * POST /api/v1/users/me/qr-code
     * Upload QR code ngân hàng (chỉ owner)
     * Form-data: file (image/*)
     */
    @PostMapping(value = "/me/qr-code", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('OWNER') or hasRole('ADMIN')")
    public ApiResponse<UserResponse> uploadQrCode(
            @AuthenticationPrincipal User currentUser,
            @RequestParam("file") MultipartFile file) throws IOException {
        return ApiResponse.ok("Upload QR code thành công", userService.uploadQrCode(currentUser, file));
    }

    /**
     * DELETE /api/v1/users/me
     * Soft delete tài khoản:
     *   1. Obfuscate email + phone
     *   2. Set deleted_at = NOW()
     *   3. Revoke tất cả refresh token
     */
    @DeleteMapping("/me")
    @ResponseStatus(HttpStatus.NO_CONTENT)
//    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ApiResponse<Void> deleteAccount(@AuthenticationPrincipal User currentUser) {
        userService.softDelete(currentUser);
        return ApiResponse.ok("Tài khoản đã được xóa");
    }

    /**
     * GET /api/v1/users/{id}
     * Lấy thông tin công khai của một user bất kỳ (tên, avatar, qr code...)
     */
    @GetMapping("/{id}")
    public ApiResponse<UserResponse> getUserById(@PathVariable Long id) {
        return ApiResponse.ok(userService.getUserById(id));
    }
}

