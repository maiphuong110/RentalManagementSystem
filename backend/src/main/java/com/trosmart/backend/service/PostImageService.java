package com.trosmart.backend.service;

import com.trosmart.backend.entity.Post;
import com.trosmart.backend.entity.PostImage;
import com.trosmart.backend.repository.PostImageRepository;
import com.trosmart.backend.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PostImageService {

    private final PostImageRepository postImageRepository;
    private final PostRepository postRepository;
    
    private static final String UPLOAD_DIR = "uploads/posts/";
    private static final String[] ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "gif", "webp"};

    @Transactional
    public PostImage uploadImage(Long postId, MultipartFile file) throws IOException {
        // Validate post exists
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));

        // Validate file is not empty
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        // Validate file extension
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !isAllowedExtension(originalFilename)) {
            throw new RuntimeException("Invalid file type. Allowed: jpg, jpeg, png, gif, webp");
        }

        // Create upload directory if not exists
        File uploadDirectory = new File(UPLOAD_DIR);
        if (!uploadDirectory.exists()) {
            uploadDirectory.mkdirs();
        }

        // Generate unique filename
        String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String uniqueFilename = UUID.randomUUID().toString() + fileExtension;
        Path filePath = Paths.get(UPLOAD_DIR, uniqueFilename);

        // Save file to disk
        Files.write(filePath, file.getBytes());

        // Create PostImage record in DB
        PostImage postImage = PostImage.builder()
                .post(post)
                .postImageUrl("/uploads/posts/" + uniqueFilename)
                .sortOrder(0)
                .build();

        return postImageRepository.save(postImage);
    }

    public List<PostImage> getImagesByPostId(Long postId) {
        // Validate post exists
        if (!postRepository.existsById(postId)) {
            throw new RuntimeException("Post not found with id: " + postId);
        }
        return postImageRepository.findByPostPostId(postId);
    }

    @Transactional
    public void deleteImage(Long postId, Long imageId) {
        PostImage postImage = postImageRepository.findByImageIdAndPostPostId(imageId, postId)
                .orElseThrow(() -> new RuntimeException("Image not found for this post"));

        // Delete file from disk
        try {
            String filename = postImage.getPostImageUrl().replace("/uploads/posts/", "");
            Path filePath = Paths.get(UPLOAD_DIR, filename);
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            // Log but don't fail if file deletion fails
            System.err.println("Failed to delete file: " + e.getMessage());
        }

        // Delete from DB
        postImageRepository.delete(postImage);
    }

    private boolean isAllowedExtension(String filename) {
        String fileExtension = filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
        for (String allowed : ALLOWED_EXTENSIONS) {
            if (fileExtension.equals(allowed)) {
                return true;
            }
        }
        return false;
    }
}

