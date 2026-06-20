package com.trosmart.backend.dto.response;

import com.trosmart.backend.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class UserResponse {

    private Long userId;
    private String email;
    private String fullName;
    private String phone;
    private String role;
    private String avatarUrl;
    private String cccdNumber;
    private String qrCodeUrl;
    private LocalDateTime createdAt;

    public static UserResponse from(User user) {
        return UserResponse.builder()
                .userId(user.getUserId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .role(user.getRole().getName())
                .avatarUrl(user.getAvatarUrl())
                .cccdNumber(user.getCccdNumber())
                .qrCodeUrl(user.getQrCodeUrl())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
