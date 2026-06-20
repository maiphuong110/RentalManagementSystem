package com.trosmart.backend.controller;

import com.trosmart.backend.dto.request.LoginRequest;
import com.trosmart.backend.dto.request.RefreshTokenRequest;
import com.trosmart.backend.dto.request.RegisterRequest;
import com.trosmart.backend.dto.response.ApiResponse;
import com.trosmart.backend.dto.response.AuthResponse;
import com.trosmart.backend.dto.response.UserResponse;
import com.trosmart.backend.entity.User;
import com.trosmart.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * POST /api/v1/auth/register
     * Body: { email, password, fullName, phone, role }
     */
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<UserResponse> register(@Valid @RequestBody RegisterRequest req) {
        return ApiResponse.ok("Đăng ký thành công", authService.register(req));
    }

    /**
     * POST /api/v1/auth/login
     * Body: { email, password }
     * Returns: { accessToken, refreshToken, expiresIn, user }
     */
    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        return ApiResponse.ok("Đăng nhập thành công", authService.login(req));
    }

    /**
     * POST /api/v1/auth/refresh
     * Body: { refreshToken }
     * Returns: new { accessToken, refreshToken } (token rotation)
     */
    @PostMapping("/refresh")
    public ApiResponse<AuthResponse> refresh(@Valid @RequestBody RefreshTokenRequest req) {
        return ApiResponse.ok("Token đã được làm mới", authService.refreshToken(req));
    }

    /**
     * POST /api/v1/auth/logout
     * Header: Authorization: Bearer <accessToken>
     * Body: { refreshToken }
     * Thu hồi refresh token hiện tại
     */
    @PostMapping("/logout")
    public ApiResponse<Void> logout(@Valid @RequestBody RefreshTokenRequest req) {
        authService.logout(req);
        return ApiResponse.ok("Đăng xuất thành công");
    }

    /**
     * POST /api/v1/auth/logout-all
     * Header: Authorization: Bearer <accessToken>
     * Thu hồi toàn bộ refresh token của user (logout tất cả thiết bị)
     */
    @PostMapping("/logout-all")
    public ApiResponse<Void> logoutAll(@AuthenticationPrincipal User currentUser) {
        authService.logoutAll(currentUser);
        return ApiResponse.ok("Đã đăng xuất khỏi tất cả thiết bị");
    }
}
