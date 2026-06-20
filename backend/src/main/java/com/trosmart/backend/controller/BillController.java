package com.trosmart.backend.controller;

import com.trosmart.backend.entity.MonthlyBill;
import com.trosmart.backend.entity.Record;
import com.trosmart.backend.service.BillService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/bills")
@RequiredArgsConstructor
public class BillController {

    private final BillService billService;

    // URL: POST http://localhost:8080/api/bills/generate-from-record?roomId=2&month=5&year=2026
    @PostMapping("/generate-from-record")
    public ResponseEntity<MonthlyBill> generateBillFromRecord(
            @RequestParam Long roomId,
            @RequestParam Integer month,
            @RequestParam Integer year,
            @RequestParam(required = false) BigDecimal elecCurrent,
            @RequestParam(required = false) BigDecimal waterCurrent,
            @RequestParam(required = false) BigDecimal elecPrevious,
            @RequestParam(required = false) BigDecimal waterPrevious) {
        try {
            MonthlyBill bill = billService.generateBillFromRecord(roomId, month, year, elecCurrent, waterCurrent, elecPrevious, waterPrevious);
            return ResponseEntity.ok(bill);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            // Concurrency fallback: if a unique key violation happens, try to retrieve the already created bill
            java.util.Optional<MonthlyBill> existingBill = billService.findExistingBill(roomId, month, year);
            if (existingBill.isPresent()) {
                return ResponseEntity.ok(existingBill.get());
            }
            throw e;
        }
    }

    // URL: GET http://localhost:8080/api/bills/latest-record?roomId=2
    @GetMapping("/latest-record")
    public ResponseEntity<Record> getLatestRecord(@RequestParam Long roomId) {
        Record record = billService.getLatestRecord(roomId);
        return ResponseEntity.ok(record);
    }

    // URL: GET http://localhost:8080/api/bills/tenant/{tenantId}
    @GetMapping("/tenant/{tenantId}")
    public ResponseEntity<java.util.List<com.trosmart.backend.dto.response.BillResponse>> getBillsByTenantId(@PathVariable Long tenantId) {
        return ResponseEntity.ok(billService.getBillsByTenantId(tenantId));
    }

    // URL: GET http://localhost:8080/api/bills/room/{roomId}
    @GetMapping("/room/{roomId}")
    public ResponseEntity<java.util.List<com.trosmart.backend.dto.response.BillResponse>> getBillsByRoomId(@PathVariable Long roomId) {
        return ResponseEntity.ok(billService.getBillsByRoomId(roomId));
    }

    // URL: PUT http://localhost:8080/api/bills/{billId}/status
    @PutMapping("/{billId}/status")
    public ResponseEntity<MonthlyBill> updateBillStatus(
            @PathVariable Long billId,
            @RequestParam String status,
            @RequestParam(required = false) String paymentProofUrl) {
        MonthlyBill bill = billService.updateBillStatus(billId, status, paymentProofUrl);
        return ResponseEntity.ok(bill);
    }

    // URL: GET http://localhost:8080/api/bills/{id}
    @GetMapping("/{id}")
    public ResponseEntity<com.trosmart.backend.dto.response.BillResponse> getBillById(@PathVariable Long id) {
        return ResponseEntity.ok(billService.getBillById(id));
    }

    // URL: POST http://localhost:8080/api/bills/upload-proof
    @PostMapping(value = "/upload-proof", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<com.trosmart.backend.dto.response.ApiResponse<String>> uploadProof(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) throws java.io.IOException {
        String url = billService.uploadProof(file);
        return ResponseEntity.ok(com.trosmart.backend.dto.response.ApiResponse.ok("Upload thành công", url));
    }
}

