package com.trosmart.backend.service;

import com.trosmart.backend.dto.request.ChatRequest.CreateConversation;
import com.trosmart.backend.dto.request.ChatRequest.SendMessage;
import com.trosmart.backend.dto.response.ChatResponse.ConversationDto;
import com.trosmart.backend.dto.response.ChatResponse.MessageDto;
import com.trosmart.backend.entity.Conversation;
import com.trosmart.backend.entity.Message;
import com.trosmart.backend.entity.Post;
import com.trosmart.backend.entity.User;
import com.trosmart.backend.exception.ResourceNotFoundException;
import com.trosmart.backend.repository.ConversationRepository;
import com.trosmart.backend.repository.MessageRepository;
import com.trosmart.backend.repository.PostRepository;
import com.trosmart.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository      messageRepository;
    private final UserRepository         userRepository;
    private final PostRepository         postRepository;
    private final NotificationService    notificationService;

    // ══════════════════════════════════════════════════════════
    // CONVERSATION
    // ══════════════════════════════════════════════════════════

    /**
     * Tạo conversation mới HOẶC trả về conversation đã tồn tại.
     * Enforce rule: user_a = MIN(id), user_b = MAX(id)
     */
    @Transactional
    public ConversationDto getOrCreate(User currentUser, CreateConversation req) {
        User receiver = userRepository.findActiveById(req.getReceiverId())
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng không tồn tại"));

        if (currentUser.getUserId().equals(receiver.getUserId())) {
            throw new IllegalArgumentException("Không thể tự nhắn tin cho chính mình");
        }

        // Sort: user_a luôn là ID nhỏ hơn
        Long userAId = Math.min(currentUser.getUserId(), receiver.getUserId());
        Long userBId = Math.max(currentUser.getUserId(), receiver.getUserId());

        User userA = currentUser.getUserId() < receiver.getUserId() ? currentUser : receiver;
        User userB = currentUser.getUserId() < receiver.getUserId() ? receiver : currentUser;

        Conversation conv = null;

        if (req.getPostId() != null) {
            // 1. Tìm cuộc hội thoại đã gắn với postId này
            Optional<Conversation> opt = conversationRepository.findByUsersAndPost(userAId, userBId, req.getPostId());
            if (opt.isPresent()) {
                conv = opt.get();
            } else {
                // 2. Nếu không có, tìm cuộc hội thoại chưa gắn post (general) để cập nhật post mới
                List<Conversation> noPostList = conversationRepository.findByUsersNoPost(userAId, userBId);
                if (!noPostList.isEmpty()) {
                    conv = noPostList.get(0);
                    Post post = postRepository.findById(req.getPostId())
                            .orElseThrow(() -> new ResourceNotFoundException("Bài đăng không tồn tại"));
                    conv.setPost(post);
                    try {
                        conv = conversationRepository.saveAndFlush(conv);
                    } catch (org.springframework.dao.DataIntegrityViolationException e) {
                        // Concurrent update fallback
                        conv = conversationRepository.findByUsersAndPost(userAId, userBId, req.getPostId())
                                .orElseThrow(() -> e);
                    }
                }
            }
        } else {
            // Nếu không yêu cầu postId, tìm cuộc hội thoại chưa gắn post (general)
            List<Conversation> noPostList = conversationRepository.findByUsersNoPost(userAId, userBId);
            if (!noPostList.isEmpty()) {
                conv = noPostList.get(0);
            } else {
                // Nếu không có cuộc hội thoại general nào, tìm bất kỳ cuộc hội thoại nào giữa 2 user
                List<Conversation> anyList = conversationRepository.findByUsers(userA, userB);
                if (!anyList.isEmpty()) {
                    conv = anyList.get(0);
                }
            }
        }

        // 3. Nếu vẫn null, tạo mới
        if (conv == null) {
            Conversation.ConversationBuilder builder = Conversation.builder()
                    .userA(userA)
                    .userB(userB);

            if (req.getPostId() != null) {
                Post post = postRepository.findById(req.getPostId())
                        .orElseThrow(() -> new ResourceNotFoundException("Bài đăng không tồn tại"));
                builder.post(post);
            }

            try {
                conv = conversationRepository.saveAndFlush(builder.build());
            } catch (org.springframework.dao.DataIntegrityViolationException e) {
                // Concurrent insert fallback
                if (req.getPostId() != null) {
                    conv = conversationRepository.findByUsersAndPost(userAId, userBId, req.getPostId())
                            .orElseThrow(() -> e);
                } else {
                    List<Conversation> noPostList = conversationRepository.findByUsersNoPost(userAId, userBId);
                    if (!noPostList.isEmpty()) {
                        conv = noPostList.get(0);
                    } else {
                        conv = conversationRepository.findByUsers(userA, userB).stream()
                                .findFirst()
                                .orElseThrow(() -> e);
                    }
                }
            }
        }

        long unread = messageRepository.countUnread(conv, currentUser.getUserId());
        return ConversationDto.from(conv, unread);
    }

    /**
     * Lấy tất cả conversation của user hiện tại.
     */
    public List<ConversationDto> getMyConversations(User currentUser) {
        return conversationRepository.findAllByUser(currentUser).stream()
                .map(c -> {
                    long unread = messageRepository.countUnread(c, currentUser.getUserId());
                    return ConversationDto.from(c, unread);
                })
                .collect(Collectors.toList());
    }

    /**
     * Lấy chi tiết 1 conversation — kiểm tra user có trong conversation không.
     */
    public ConversationDto getOne(User currentUser, Long conversationId) {
        Conversation conv = findAndValidate(currentUser, conversationId);
        long unread = messageRepository.countUnread(conv, currentUser.getUserId());
        return ConversationDto.from(conv, unread);
    }

    // ══════════════════════════════════════════════════════════
    // MESSAGE
    // ══════════════════════════════════════════════════════════

    /**
     * Gửi tin nhắn vào conversation.
     * Tự động:
     *   - Cập nhật conversation.last_message_at
     *   - Đẩy notification cho bên còn lại
     */
    @Transactional
    public MessageDto sendMessage(User sender, Long conversationId, SendMessage req) {
        Conversation conv = findAndValidate(sender, conversationId);

        Message msg = Message.builder()
                .conversation(conv)
                .sender(sender)
                .content(req.getContent())
                .sentAt(LocalDateTime.now())
                .read(false)
                .build();

        Message saved = messageRepository.save(msg);

        // Cập nhật last_message_at
        conv.setLastMessageAt(saved.getSentAt());
        conversationRepository.save(conv);

        // Push notification cho người nhận
        User recipient = conv.getUserA().getUserId().equals(sender.getUserId())
                ? conv.getUserB()
                : conv.getUserA();
        notificationService.pushNewMessage(recipient, sender.getFullName(), conversationId);

        return MessageDto.from(saved);
    }

    /**
     * Lấy tin nhắn trong conversation (phân trang, cũ → mới).
     * Đồng thời đánh dấu đã đọc tất cả tin nhắn của bên kia.
     */
    @Transactional
    public Page<MessageDto> getMessages(User currentUser, Long conversationId, int page, int size) {
        Conversation conv = findAndValidate(currentUser, conversationId);

        // Đánh dấu đã đọc
        messageRepository.markAllAsRead(conv, currentUser.getUserId());

        Pageable pageable = PageRequest.of(page, size);
        return messageRepository
                .findByConversationOrderBySentAtAsc(conv, pageable)
                .map(MessageDto::from);
    }

    /**
     * Tổng tin chưa đọc trên toàn bộ conversation (dùng cho badge).
     */
    public long getTotalUnread(User currentUser) {
        return messageRepository.countTotalUnread(currentUser.getUserId());
    }

    // ── Private ──────────────────────────────────────────────
    private Conversation findAndValidate(User user, Long conversationId) {
        Conversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation không tồn tại"));

        boolean isMember = conv.getUserA().getUserId().equals(user.getUserId())
                || conv.getUserB().getUserId().equals(user.getUserId());

        if (!isMember) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "Bạn không có quyền truy cập conversation này");
        }

        return conv;
    }
}
