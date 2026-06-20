package com.trosmart.backend.entity;

import com.trosmart.backend.entity.Post;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Post_Rule")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "rule_id")
    private Long ruleId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    @JsonIgnore
    private Post post;

    @Column(name = "rule_text", nullable = false, length = 500)
    private String ruleText;

    @Column(name = "sort_order")
    private Integer sortOrder;
}