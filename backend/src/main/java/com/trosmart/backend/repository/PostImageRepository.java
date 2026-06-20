package com.trosmart.backend.repository;

import com.trosmart.backend.entity.PostImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostImageRepository extends JpaRepository<PostImage, Long> {
    
    List<PostImage> findByPostPostId(Long postId);
    
    Optional<PostImage> findByImageIdAndPostPostId(Long imageId, Long postId);
    
    void deleteByPostPostId(Long postId);
}

