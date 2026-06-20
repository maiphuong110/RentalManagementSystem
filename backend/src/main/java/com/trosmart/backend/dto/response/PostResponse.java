package com.trosmart.backend.dto.response;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostResponse {
    
    private Long postId;
    private Long roomId;
    private String title;
    private String description;
    private String status;
    private LocalDateTime publishedAt;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<PostImageResponse> images;
    private List<PostRuleResponse> rules;
}

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
class PostImageResponse {
    private Long imageId;
    private String imageUrl;
}

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
class PostRuleResponse {
    private Long ruleId;
    private String ruleText;
    private Integer sortOrder;
}

