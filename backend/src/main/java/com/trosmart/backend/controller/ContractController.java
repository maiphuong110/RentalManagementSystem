package com.trosmart.backend.controller;

import com.trosmart.backend.dto.request.ContractRequest;
import com.trosmart.backend.dto.request.SignatureRequest;
import com.trosmart.backend.entity.Contract;
import com.trosmart.backend.service.ContractService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contracts")
@RequiredArgsConstructor
public class ContractController {

    private final ContractService contractService;
    private final com.trosmart.backend.repository.UserRepository userRepository;

    // 1. API Tạo hợp đồng nháp (Chủ nhà gọi khi chốt phòng với khách)
    // URL: POST http://localhost:8080/api/contracts/create?ownerId=1
    @PostMapping("/create")
    public ResponseEntity<Contract> createContract(
            @RequestBody ContractRequest request,
            @RequestParam Long ownerId) {
        Contract contract = contractService.createContract(request, ownerId);
        return ResponseEntity.ok(contract);
    }

    // 2. API Ký hợp đồng bằng OTP (Cả chủ nhà và khách đều dùng chung để xác thực)
    // URL: POST http://localhost:8080/api/contracts/sign
    @PostMapping("/sign")
    public ResponseEntity<String> signContract(@RequestBody SignatureRequest request) {
        String result = contractService.verifySignature(request.getContractId(), request.getOtpCode());
        return ResponseEntity.ok(result);
    }

    // 3. API Lấy hợp đồng đang hoạt động của Khách thuê
    // URL: GET http://localhost:8080/api/contracts/tenant/{tenantId}
    @GetMapping("/tenant/{tenantId}")
    public ResponseEntity<Contract> getActiveContract(@PathVariable Long tenantId) {
        Contract contract = contractService.getActiveContractByTenantId(tenantId);
        if (contract == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(contract);
    }

    // 4. API Lấy hợp đồng đang hoạt động của phòng trọ (kèm thông tin khách thuê)
    // URL: GET http://localhost:8080/api/contracts/room/{roomId}/active
    @GetMapping("/room/{roomId}/active")
    public ResponseEntity<?> getActiveContractByRoom(@PathVariable Long roomId) {
        Contract contract = contractService.getActiveContractByRoomId(roomId);
        if (contract == null) {
            return ResponseEntity.notFound().build();
        }
        
        com.trosmart.backend.entity.User tenant = userRepository.findActiveById(contract.getTenantId()).orElse(null);
        
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("contract", contract);
        if (tenant != null) {
            java.util.Map<String, Object> tenantInfo = new java.util.HashMap<>();
            tenantInfo.put("userId", tenant.getUserId());
            tenantInfo.put("fullName", tenant.getFullName());
            tenantInfo.put("phone", tenant.getPhone());
            tenantInfo.put("email", tenant.getEmail());
            tenantInfo.put("avatarUrl", tenant.getAvatarUrl());
            tenantInfo.put("cccdNumber", tenant.getCccdNumber());
            response.put("tenant", tenantInfo);
        }
        return ResponseEntity.ok(response);
    }
}