package com.trosmart.backend.service;

import com.trosmart.backend.dto.request.LoginRequest;
import com.trosmart.backend.dto.request.RefreshTokenRequest;
import com.trosmart.backend.dto.request.RegisterRequest;
import com.trosmart.backend.dto.response.AuthResponse;
import com.trosmart.backend.dto.response.UserResponse;
import com.trosmart.backend.entity.RefreshToken;
import com.trosmart.backend.entity.Role;
import com.trosmart.backend.entity.User;
import com.trosmart.backend.exception.DuplicateResourceException;
import com.trosmart.backend.exception.ResourceNotFoundException;
import com.trosmart.backend.repository.RefreshTokenRepository;
import com.trosmart.backend.repository.RoleRepository;
import com.trosmart.backend.repository.UserRepository;
import com.trosmart.backend.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository     userRepository;
    private final RoleRepository     roleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder    passwordEncoder;
    private final JwtUtil            jwtUtil;

    @Value("${app.jwt.refresh-expiration-days:7}")
    private int refreshExpirationDays;

    // ── Register ─────────────────────────────────────────────
    @Transactional
    public UserResponse register(RegisterRequest req) {
        // Application-level unique check (vì UNIQUE KEY đã bị bỏ khỏi DDL)
        if (userRepository.existsActiveByEmail(req.getEmail())) {
            throw new DuplicateResourceException("Email đã được sử dụng");
        }
        if (req.getPhone() != null && userRepository.existsActiveByPhone(req.getPhone())) {
            throw new DuplicateResourceException("Số điện thoại đã được sử dụng");
        }

        Role role = roleRepository.findByName(req.getRole())
                .orElseThrow(() -> new ResourceNotFoundException("Role không hợp lệ"));

        User user = User.builder()
                .email(req.getEmail())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .fullName(req.getFullName())
                .phone(req.getPhone())
                .role(role)
                .build();

        return UserResponse.from(userRepository.save(user));
    }

    // ── Login ─────────────────────────────────────────────────
    @Transactional
    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findActiveByEmail(req.getEmail())
                .orElseThrow(() -> new org.springframework.security.authentication
                        .BadCredentialsException("Email hoặc mật khẩu không đúng"));

        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new org.springframework.security.authentication
                    .BadCredentialsException("Email hoặc mật khẩu không đúng");
        }

        return buildAuthResponse(user);
    }

    // ── Refresh Token ─────────────────────────────────────────
    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest req) {
        String hash = hashToken(req.getRefreshToken());

        RefreshToken stored = refreshTokenRepository.findByTokenHash(hash)
                .orElseThrow(() -> new IllegalArgumentException("Refresh token không hợp lệ"));

        if (!stored.isValid()) {
            throw new IllegalArgumentException("Refresh token đã hết hạn hoặc bị thu hồi");
        }

        // Thu hồi token cũ (rotation strategy — mỗi lần refresh tạo token mới)
        stored.setRevoked(true);
        refreshTokenRepository.save(stored);

        User user = stored.getUser();
        if (user.isDeleted()) {
            throw new IllegalArgumentException("Tài khoản không còn tồn tại");
        }

        return buildAuthResponse(user);
    }

    // ── Logout ───────────────────────────────────────────────
    @Transactional
    public void logout(RefreshTokenRequest req) {
        String hash = hashToken(req.getRefreshToken());
        refreshTokenRepository.findByTokenHash(hash)
                .ifPresent(rt -> {
                    rt.setRevoked(true);
                    refreshTokenRepository.save(rt);
                });
    }

    @Transactional
    public void logoutAll(User user) {
        refreshTokenRepository.revokeAllByUser(user);
    }

    // ── Private helpers ───────────────────────────────────────
    private AuthResponse buildAuthResponse(User user) {
        String accessToken  = jwtUtil.generateToken(
                user.getUserId(), user.getEmail(), user.getRole().getName());

        // Tạo raw refresh token ngẫu nhiên, lưu hash vào DB
        String rawRefresh   = UUID.randomUUID().toString();
        String refreshHash  = hashToken(rawRefresh);

        RefreshToken rt = RefreshToken.builder()
                .tokenHash(refreshHash)
                .user(user)
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusDays(refreshExpirationDays))
                .revoked(false)
                .build();
        refreshTokenRepository.save(rt);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(rawRefresh)
                .tokenType("Bearer")
                .expiresIn(jwtUtil.getExpirationMs() / 1000)
                .user(UserResponse.from(user))
                .build();
    }

    /**
     * SHA-256 hash của raw token để lưu DB.
     * Không dùng BCrypt vì cần lookup bằng hash (không cần so sánh).
     */
    private String hashToken(String raw) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest(raw.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hashed);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi hash token", e);
        }
    }
}
