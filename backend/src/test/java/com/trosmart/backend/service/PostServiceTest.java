package com.trosmart.backend.service;

import com.trosmart.backend.dto.request.PostCreateRequest;
import com.trosmart.backend.entity.Post;
import com.trosmart.backend.entity.Room;
import com.trosmart.backend.repository.RoomRepository;
import com.trosmart.backend.repository.PostRepository;
import com.trosmart.backend.repository.UserRepository;
import com.trosmart.backend.entity.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
public class PostServiceTest {

    @Autowired
    private PostService postService;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    public void testCreatePostSuccess() {
        // Find a room to associate with the post
        List<Room> rooms = roomRepository.findAll();
        assertFalse(rooms.isEmpty(), "Rooms list should not be empty (please ensure DB is seeded)");
        Room room = rooms.get(0);

        PostCreateRequest request = new PostCreateRequest();
        request.setRoomId(room.getRoomId());
        request.setTitle("Test Post Title");
        request.setDescription("Test Post Description");
        request.setStatus("active");
        request.setPublishedAt(LocalDateTime.now());
        request.setExpiresAt(LocalDateTime.now().plusDays(30));

        Post post = postService.createPost(request, 1L);
        assertNotNull(post);
        assertNotNull(post.getPostId());
        assertEquals("Test Post Title", post.getTitle());
        assertEquals("active", post.getStatus());
        assertEquals(room.getRoomId(), post.getRoomId());

        // Verify that the post is retrievable by status
        List<Post> activePosts = postService.getAllPostsByStatus("active");
        assertTrue(activePosts.stream().anyMatch(p -> p.getPostId().equals(post.getPostId())), 
                   "Saved post should be returned in active posts list");
    }
}
