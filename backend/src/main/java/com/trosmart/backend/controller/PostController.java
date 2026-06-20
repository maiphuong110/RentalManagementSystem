package com.trosmart.backend.controller;

import com.trosmart.backend.dto.request.PostCreateRequest;
import com.trosmart.backend.entity.Post;
import com.trosmart.backend.entity.PostImage;
import com.trosmart.backend.service.PostService;
import com.trosmart.backend.service.PostImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;
    private final PostImageService postImageService;

    // Create a new post
    @PostMapping
    public ResponseEntity<Post> createPost(@RequestBody PostCreateRequest request) {
        // TODO: Get actual user ID from authentication context
        Long postedBy = 1L; // Placeholder
        Post post = postService.createPost(request, postedBy);
        return ResponseEntity.ok(post);
    }

    // Get all posts with optional status filter
    @GetMapping
    public ResponseEntity<List<Post>> getAllPosts(@RequestParam(required = false) String status) {
        List<Post> posts;
        if (status != null && !status.isEmpty() && !status.equalsIgnoreCase("all")) {
            posts = postService.getAllPostsByStatus(status);
        } else {
            posts = postService.getAllPosts();
        }
        return ResponseEntity.ok(posts);
    }

    // Get post by ID
    @GetMapping("/{postId}")
    public ResponseEntity<Post> getPostById(@PathVariable Long postId) {
        return postService.getPostById(postId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Update post
    @PutMapping("/{postId}")
    public ResponseEntity<Post> updatePost(@PathVariable Long postId, @RequestBody PostCreateRequest request) {
        Post post = postService.updatePost(postId, request);
        return ResponseEntity.ok(post);
    }

    // Delete post
    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> deletePost(@PathVariable Long postId) {
        postService.deletePost(postId);
        return ResponseEntity.noContent().build();
    }

    // Upload image for post
    @PostMapping("/{postId}/images")
    public ResponseEntity<PostImage> uploadImage(@PathVariable Long postId, 
                                                  @RequestParam("file") MultipartFile file) {
        try {
            PostImage image = postImageService.uploadImage(postId, file);
            return ResponseEntity.ok(image);
        } catch (IOException e) {
            return ResponseEntity.status(500).build();
        }
    }

    // Get images for post
    @GetMapping("/{postId}/images")
    public ResponseEntity<List<PostImage>> getPostImages(@PathVariable Long postId) {
        List<PostImage> images = postImageService.getImagesByPostId(postId);
        return ResponseEntity.ok(images);
    }

    // Delete image from post
    @DeleteMapping("/{postId}/images/{imageId}")
    public ResponseEntity<Void> deleteImage(@PathVariable Long postId, @PathVariable Long imageId) {
        postImageService.deleteImage(postId, imageId);
        return ResponseEntity.noContent().build();
    }
}

