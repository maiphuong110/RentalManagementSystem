package com.trosmart.backend.service;

import com.trosmart.backend.dto.response.ChatResponse.NotificationDto;
import com.trosmart.backend.entity.Notification;
import com.trosmart.backend.entity.Notification.Type;
import com.trosmart.backend.entity.User;
import com.trosmart.backend.exception.ResourceNotFoundException;
import com.trosmart.backend.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    // ── Lấy danh sách notification của user ───────────────────
    public Page<NotificationDto> getMyNotifications(User user, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return notificationRepository
                .findByUserOrderByCreatedAtDesc(user, pageable)
                .map(NotificationDto::from);
    }

    // ── Đếm unread (dùng cho bell icon badge) ─────────────────
    public long countUnread(User user) {
        return notificationRepository.countByUserAndReadFalse(user);
    }

    // ── Đánh dấu 1 notification đã đọc ───────────────────────
    @Transactional
    public NotificationDto markAsRead(User user, Long notificationId) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification không tồn tại"));

        // Chỉ owner của notification mới được đánh dấu
        if (!n.getUser().getUserId().equals(user.getUserId())) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "Bạn không có quyền thực hiện hành động này");
        }

        n.setRead(true);
        return NotificationDto.from(notificationRepository.save(n));
    }

    // ── Đánh dấu tất cả đã đọc ────────────────────────────────
    @Transactional
    public int markAllAsRead(User user) {
        return notificationRepository.markAllAsRead(user);
    }

    // ── Tạo notification (gọi nội bộ từ các service khác) ────
    @Transactional
    public void push(User recipient, Type type,
                     String refTable, Long refId,
                     String title, String body) {
        Notification n = Notification.builder()
                .user(recipient)
                .type(type)
                .refTable(refTable)
                .refId(refId)
                .title(title)
                .body(body)
                .read(false)
                .build();
        notificationRepository.save(n);
    }

    // ── Shortcut methods cho từng loại event ──────────────────

    public void pushNewMessage(User recipient, String senderName, Long conversationId) {
        push(recipient,
             Type.new_message,
             "Conversation", conversationId,
             "Tin nhắn mới từ " + senderName,
             senderName + " vừa gửi cho bạn một tin nhắn.");
    }

    public void pushBillDue(User tenant, Long billId, String totalAmount) {
        push(tenant,
             Type.bill_due,
             "Monthly_Bill", billId,
             "Hóa đơn tháng này chưa thanh toán",
             "Hóa đơn " + totalAmount + "đ đang chờ thanh toán.");
    }

    public void pushPaymentReceived(User owner, String tenantName, Long billId) {
        push(owner,
             Type.payment_received,
             "Monthly_Bill", billId,
             "Tenant gửi bằng chứng thanh toán",
             tenantName + " đã upload ảnh chuyển khoản. Vui lòng xác nhận.");
    }

    public void pushContractExpiry(User recipient, Long contractId, String roomNumber) {
        push(recipient,
             Type.contract_expiry,
             "Contracts", contractId,
             "Hợp đồng sắp hết hạn",
             "Hợp đồng phòng " + roomNumber + " sẽ hết hạn trong 7 ngày.");
    }
}
