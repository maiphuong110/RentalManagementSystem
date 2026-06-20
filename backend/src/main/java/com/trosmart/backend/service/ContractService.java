package com.trosmart.backend.service;

import com.trosmart.backend.dto.request.ContractRequest;
import com.trosmart.backend.entity.Contract;
import com.trosmart.backend.repository.ContractRepository;
import com.trosmart.backend.repository.PostRepository;
import org.springframework.jdbc.core.JdbcTemplate;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ContractService {

    private final ContractRepository contractRepository;
    private final PostRepository postRepository;
    private final JdbcTemplate jdbcTemplate;

    // 1. Tạo hợp đồng nháp và sinh mã OTP hệ thống lưu vào e_signature_otp
    @Transactional
    public Contract createContract(ContractRequest request, Long ownerId) {
        // Validate that referenced Room and Tenant exist to avoid DB FK exception
        Long roomId = request.getRoomId();
        Long tenantId = request.getTenantId();

        Integer roomExists = jdbcTemplate.queryForObject(
                "SELECT COUNT(1) FROM `room` WHERE room_id = ?", Integer.class, roomId);
        if (roomExists == null || roomExists == 0) {
            throw new RuntimeException("Phòng (room_id=" + roomId + ") không tồn tại. Vui lòng kiểm tra roomId trong request.");
        }

        Integer tenantExists = jdbcTemplate.queryForObject(
                "SELECT COUNT(1) FROM `user` WHERE user_id = ?", Integer.class, tenantId);
        if (tenantExists == null || tenantExists == 0) {
            throw new RuntimeException("Người thuê (tenantId=" + tenantId + ") không tồn tại. Vui lòng kiểm tra tenantId trong request.");
        }

        String randomOtp = String.format("%06d", new SecureRandom().nextInt(999999));

        Contract contract = Contract.builder()
                .roomId(request.getRoomId())
                .ownerId(ownerId)
                .tenantId(request.getTenantId())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .depositAmount(request.getDepositAmount())
                .eSignatureOtp(randomOtp) // Lưu mã OTP trực tiếp vào hợp đồng theo sơ đồ mới
                .status("pending")
                .createdAt(LocalDateTime.now()) // <-- THÊM DÒNG NÀY ĐỂ ĐỒNG BỘ THỜI GIAN TẠO
                .updatedAt(LocalDateTime.now()) // <-- THÊM DÒNG NÀY ĐỂ FIX TRIỆT ĐỂ LỖI Column 'updated_at' cannot be null
                .build();

        System.out.println("=== TEST OTP FOR CONTRACT SIGNING IS: " + randomOtp);
        return contractRepository.save(contract);
    }

    // 2. Xác thực OTP ký kết (Kích hoạt hợp đồng + Tự động ẩn bài đăng phòng đó)
    @Transactional
    public String verifySignature(Long contractId, String otpCode) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hợp đồng!"));

        if ("active".equals(contract.getStatus())) {
            return "Hợp đồng này đã được ký và kích hoạt trước đó!";
        }

        if (!contract.getESignatureOtp().equals(otpCode)) {
            throw new RuntimeException("Mã OTP ký kết không chính xác!");
        }

        // Cập nhật trạng thái hợp đồng thành active
        contract.setStatus("active");
        contract.setSignedAt(LocalDateTime.now());
        contract.setUpdatedAt(LocalDateTime.now()); // <-- NÊN CẬP NHẬT CẢ Ở ĐÂY KHI THAY ĐỔI TRẠNG THÁI HỢP ĐỒNG
        contractRepository.save(contract);

        // TỰ ĐỘNG HÓA: Ẩn ngay bài viết tìm người thuê của phòng này (UR-L02 / FR-02)
        postRepository.hidePostByRoomId(contract.getRoomId());

        // Cập nhật trạng thái phòng thành 'unavailable' (Đã thuê)
        jdbcTemplate.update("UPDATE `room` SET status = 'unavailable' WHERE room_id = ?", contract.getRoomId());

        return "Ký hợp đồng thành công! Phòng đã được thuê, tin đăng tìm phòng đã tự động ẩn.";
    }

    // 3. Lấy hợp đồng đang hoạt động hoặc đang chờ ký (pending) của Khách thuê
    public Contract getActiveContractByTenantId(Long tenantId) {
        java.util.List<Contract> contracts = contractRepository.findByTenantId(tenantId);
        // 1. Ưu tiên hợp đồng đã ký (active)
        Contract active = contracts.stream()
                .filter(c -> "active".equals(c.getStatus()))
                .findFirst()
                .orElse(null);
        if (active != null) return active;

        // 2. Trả về hợp đồng đang chờ ký (pending) nếu chưa ký hợp đồng nào
        return contracts.stream()
                .filter(c -> "pending".equals(c.getStatus()))
                .findFirst()
                .orElse(null);
    }

    // 4. Lấy hợp đồng đang hoạt động của phòng trọ
    public Contract getActiveContractByRoomId(Long roomId) {
        java.util.List<Contract> contracts = contractRepository.findByRoomIdAndStatus(roomId, "active");
        if (contracts.isEmpty()) {
            return null;
        }
        return contracts.get(0);
    }
}