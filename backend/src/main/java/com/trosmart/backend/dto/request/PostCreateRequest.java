package com.trosmart.backend.dto.request;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostCreateRequest {
    
    private Long roomId;
    private String title;
    private String description;
    private String status;
    private LocalDateTime publishedAt;
    private LocalDateTime expiresAt;
}

