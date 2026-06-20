package com.trosmart.backend.service;

import com.trosmart.backend.dto.request.PostCreateRequest;
import com.trosmart.backend.entity.Post;
import com.trosmart.backend.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;

    // Create a new post
    @Transactional
    public Post createPost(PostCreateRequest request, Long postedBy) {
        Post post = Post.builder()
                .roomId(request.getRoomId())
                .title(request.getTitle())
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus() : "active")
                .publishedAt(request.getPublishedAt() != null ? request.getPublishedAt() : LocalDateTime.now())
                .expiresAt(request.getExpiresAt())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        
        return postRepository.save(post);
    }

    // Get all posts by status
    public List<Post> getAllPostsByStatus(String status) {
        return postRepository.findByStatus(status);
    }

    // Get all posts
    public List<Post> getAllPosts() {
        return postRepository.findAll();
    }

    // Get post by ID
    public Optional<Post> getPostById(Long postId) {
        return postRepository.findById(postId);
    }

    // Get post by room ID
    public Optional<Post> getPostByRoomId(Long roomId) {
        return postRepository.findByRoomId(roomId);
    }

    // Update post
    @Transactional
    public Post updatePost(Long postId, PostCreateRequest request) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));
        
        if (request.getTitle() != null) post.setTitle(request.getTitle());
        if (request.getDescription() != null) post.setDescription(request.getDescription());
        if (request.getStatus() != null) post.setStatus(request.getStatus());
        if (request.getExpiresAt() != null) post.setExpiresAt(request.getExpiresAt());
        
        post.setUpdatedAt(LocalDateTime.now());
        
        return postRepository.save(post);
    }

    // Delete post
    @Transactional
    public void deletePost(Long postId) {
        postRepository.deleteById(postId);
    }

    // Hide post by room ID (auto on contract signed)
    @Transactional
    public int hidePostByRoomId(Long roomId) {
        return postRepository.hidePostByRoomId(roomId);
    }
}

