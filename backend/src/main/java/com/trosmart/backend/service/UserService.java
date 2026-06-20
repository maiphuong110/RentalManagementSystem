package com.trosmart.backend.service;

import com.trosmart.backend.dto.request.UpdateProfileRequest;
import com.trosmart.backend.dto.response.UserResponse;
import com.trosmart.backend.entity.User;
import com.trosmart.backend.exception.DuplicateResourceException;
import com.trosmart.backend.repository.RefreshTokenRepository;
import com.trosmart.backend.repository.UserRepository;
import com.trosmart.backend.util.FileStorageUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository         userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final FileStorageUtil        fileStorageUtil;

    // ── Get profile ───────────────────────────────────────────
    public UserResponse getProfile(User currentUser) {
        return UserResponse.from(currentUser);
    }

    // ── Update profile ────────────────────────────────────────
    @Transactional
    public UserResponse updateProfile(User currentUser, UpdateProfileRequest req) {
        // Kiểm tra phone trùng (chỉ khi thay đổi)
        if (req.getPhone() != null
                && !req.getPhone().equals(currentUser.getPhone())
                && userRepository.existsActiveByPhone(req.getPhone())) {
            throw new DuplicateResourceException("Số điện thoại đã được sử dụng bởi tài khoản khác");
        }

        // Kiểm tra CCCD trùng (chỉ khi thay đổi)
        if (req.getCccdNumber() != null
                && !req.getCccdNumber().equals(currentUser.getCccdNumber())) {
            userRepository.findActiveByCccd(req.getCccdNumber()).ifPresent(u -> {
                if (!u.getUserId().equals(currentUser.getUserId())) {
                    throw new DuplicateResourceException("Số CCCD đã được đăng ký bởi tài khoản khác");
                }
            });
        }

        if (req.getFullName()   != null) currentUser.setFullName(req.getFullName());
        if (req.getPhone()      != null) currentUser.setPhone(req.getPhone());
        if (req.getCccdNumber() != null) currentUser.setCccdNumber(req.getCccdNumber());

        return UserResponse.from(userRepository.save(currentUser));
    }

    // ── Upload avatar ─────────────────────────────────────────
    @Transactional
    public UserResponse uploadAvatar(User currentUser, MultipartFile file) throws IOException {
        // Xóa avatar cũ nếu có
        if (currentUser.getAvatarUrl() != null) {
            fileStorageUtil.delete(currentUser.getAvatarUrl());
        }

        String url = fileStorageUtil.store(file, "avatars");
        currentUser.setAvatarUrl(url);

        return UserResponse.from(userRepository.save(currentUser));
    }

    // ── Upload QR code ────────────────────────────────────────
    @Transactional
    public UserResponse uploadQrCode(User currentUser, MultipartFile file) throws IOException {
        // Chỉ owner mới cần QR (nhưng không block ở đây — để controller xử lý @PreAuthorize)
        if (currentUser.getQrCodeUrl() != null) {
            fileStorageUtil.delete(currentUser.getQrCodeUrl());
        }

        String url = fileStorageUtil.store(file, "qr");
        currentUser.setQrCodeUrl(url);

        return UserResponse.from(userRepository.save(currentUser));
    }

    // ── Soft delete ───────────────────────────────────────────
    /**
     * Soft delete với email/phone obfuscation.
     *
     * Tại sao obfuscate?
     *   Bảng User không có UNIQUE KEY trên email/phone (đã bỏ để tránh conflict
     *   với soft-delete). Nhưng Backend vẫn check unique ở application layer.
     *   Nếu chỉ set deleted_at mà không obfuscate, email/phone cũ vẫn bị "chiếm",
     *   user không đăng ký lại được bằng email/phone đó.
     *   Obfuscation: "abc@gmail.com" → "abc@gmail.com-deleted-42"
     */
    @Transactional
    public void softDelete(User currentUser) {
        Long id = currentUser.getUserId();

        // 1. Obfuscate email và phone để nhả "slot"
        currentUser.setEmail(currentUser.getEmail() + "-deleted-" + id);
        if (currentUser.getPhone() != null) {
            currentUser.setPhone(currentUser.getPhone() + "-deleted-" + id);
        }

        // 2. Set deleted_at
        currentUser.setDeletedAt(LocalDateTime.now());

        // 3. Thu hồi toàn bộ refresh token
        refreshTokenRepository.revokeAllByUser(currentUser);

        userRepository.save(currentUser);
        log.info("User {} soft-deleted at {}", id, currentUser.getDeletedAt());
    }

    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));
        return UserResponse.from(user);
    }
}

