package com.trosmart.backend.service;

import com.trosmart.backend.entity.MonthlyBill;
import com.trosmart.backend.entity.Record;
import com.trosmart.backend.entity.Room;
import com.trosmart.backend.dto.response.BillResponse;
import com.trosmart.backend.repository.MonthlyBillRepository;
import com.trosmart.backend.repository.RecordRepository;
import com.trosmart.backend.repository.RoomRepository;
import com.trosmart.backend.repository.ContractRepository;
import com.trosmart.backend.util.FileStorageUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class BillService {

    private final RecordRepository recordRepository;
    private final MonthlyBillRepository monthlyBillRepository;
    private final RoomRepository roomRepository;
    private final ContractRepository contractRepository;
    private final FileStorageUtil fileStorageUtil;

    @Transactional
    public MonthlyBill generateBillFromRecord(Long roomId, Integer month, Integer year,
                                               BigDecimal elecCurrent, BigDecimal waterCurrent,
                                               BigDecimal elecPrevious, BigDecimal waterPrevious) {
        // 1. Tìm hoặc tự động khởi tạo bản ghi số điện nước
        java.util.Optional<Record> recordOpt = recordRepository.findByRoomIdAndBillingMonthAndBillingYear(roomId, month, year);
        Record record;
        if (recordOpt.isPresent()) {
            record = recordOpt.get();
        } else {
            // Kiểm tra hợp đồng đang hoạt động cho phòng
            java.util.List<com.trosmart.backend.entity.Contract> contracts = contractRepository.findByRoomIdAndStatus(roomId, "active");
            com.trosmart.backend.entity.Contract contract = contracts.stream().findFirst()
                    .orElseThrow(() -> new RuntimeException("Phòng này hiện tại không có hợp đồng thuê hoạt động nào! Không thể tạo hóa đơn."));

            // Tìm thông tin phòng để lấy đơn giá
            com.trosmart.backend.entity.Room room = roomRepository.findById(roomId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin phòng!"));

            BigDecimal finalElecPrev = elecPrevious;
            BigDecimal finalWaterPrev = waterPrevious;

            // Nếu chỉ số trước không truyền vào, tìm chỉ số tháng trước đó
            if (finalElecPrev == null || finalWaterPrev == null) {
                int prevMonth = month - 1;
                int prevYear = year;
                if (prevMonth == 0) {
                    prevMonth = 12;
                    prevYear = year - 1;
                }
                java.util.Optional<Record> prevRecordOpt = recordRepository.findByRoomIdAndBillingMonthAndBillingYear(roomId, prevMonth, prevYear);
                if (prevRecordOpt.isPresent()) {
                    if (finalElecPrev == null) finalElecPrev = prevRecordOpt.get().getElecCurrent();
                    if (finalWaterPrev == null) finalWaterPrev = prevRecordOpt.get().getWaterCurrent();
                } else {
                    if (finalElecPrev == null) finalElecPrev = BigDecimal.ZERO;
                    if (finalWaterPrev == null) finalWaterPrev = BigDecimal.ZERO;
                }
            }

            BigDecimal finalElecCur = elecCurrent != null ? elecCurrent : finalElecPrev;
            BigDecimal finalWaterCur = waterCurrent != null ? waterCurrent : finalWaterPrev;

            // Lấy giá trị cấu hình điện nước và tiền thuê của phòng
            BigDecimal basePrice = room.getBasePrice();
            if (basePrice == null && room.getProperty() != null) {
                basePrice = room.getProperty().getBasePrice();
            }
            BigDecimal elecPrice = room.getElecPriceKwh() != null ? room.getElecPriceKwh() : BigDecimal.ZERO;
            BigDecimal waterPrice = room.getWaterPriceM3();
            if (waterPrice == null && room.getProperty() != null) {
                waterPrice = room.getProperty().getWaterPriceM3();
            }
            if (waterPrice == null) waterPrice = BigDecimal.ZERO;
            if (basePrice == null) basePrice = BigDecimal.ZERO;

            record = Record.builder()
                    .roomId(roomId)
                    .contractId(contract.getContractId())
                    .billingMonth(month)
                    .billingYear(year)
                    .elecPrevious(finalElecPrev)
                    .elecCurrent(finalElecCur)
                    .elecAmount(elecPrice)
                    .waterPrevious(finalWaterPrev)
                    .waterCurrent(finalWaterCur)
                    .waterAmount(waterPrice)
                    .appliedNormalPrice(basePrice)
                    .build();

            record = recordRepository.save(record);
        }

        // Kiểm tra xem hóa đơn tháng này của Record đã được tạo trước đó chưa để tránh lỗi trùng lặp unique key
        java.util.List<MonthlyBill> existingBills = monthlyBillRepository.findByRecordId(record.getRecordId());
        if (!existingBills.isEmpty()) {
            return existingBills.get(0);
        }

        // 2. TÍNH LƯỢNG TIÊU THỤ
        BigDecimal elecUsage = record.getElecCurrent().subtract(record.getElecPrevious());
        BigDecimal waterUsage = record.getWaterCurrent().subtract(record.getWaterPrevious());

        if (elecUsage.compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException("Chỉ số điện mới không được nhỏ hơn chỉ số điện cũ!");
        }
        if (waterUsage.compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException("Chỉ số nước mới không được nhỏ hơn chỉ số nước cũ!");
        }

        // 3. LOGIC TÍNH TIỀN ĐIỆN (Đã sửa lỗi gán nhầm appliedNormalPrice)
        BigDecimal elecBill = record.getElecAmount().multiply(elecUsage);

        // 4. LOGIC TÍNH TIỀN NƯỚC
        BigDecimal waterBill = record.getWaterAmount().multiply(waterUsage);

        // 5. Chi phí cố định khác
        BigDecimal aminityBill = new BigDecimal("150000.00");
        // Room monthly rent: use applied_normal_price from the Record
        BigDecimal roomBill = record.getAppliedNormalPrice() != null ? record.getAppliedNormalPrice() : BigDecimal.ZERO;

        // Tổng tiền hóa đơn tháng
        BigDecimal totalAmount = roomBill.add(elecBill).add(waterBill).add(aminityBill);

        // 6. Build Entity - Đảm bảo truyền đủ các trường Amount tiêu thụ xuống DB
        MonthlyBill bill = MonthlyBill.builder()
                .recordId(record.getRecordId())
                .billingDate(LocalDate.now())
                .roomBill(roomBill)
                .elecBill(elecBill)
                .waterBill(waterBill)
                .amenityBill(aminityBill)
                .totalAmount(totalAmount)
                .status("unpaid")
                .build();

        return monthlyBillRepository.save(bill);
    }

    public Record getLatestRecord(Long roomId) {
        return recordRepository.findFirstByRoomIdOrderByBillingYearDescBillingMonthDesc(roomId)
                .orElse(null);
    }

    public java.util.List<BillResponse> getBillsByTenantId(Long tenantId) {
        java.util.List<MonthlyBill> bills = monthlyBillRepository.findByTenantId(tenantId);
        return mapToBillResponses(bills);
    }

    public java.util.List<BillResponse> getBillsByRoomId(Long roomId) {
        java.util.List<MonthlyBill> bills = monthlyBillRepository.findByRoomId(roomId);
        return mapToBillResponses(bills);
    }

    @Transactional
    public MonthlyBill updateBillStatus(Long billId, String status, String paymentProofUrl) {
        MonthlyBill bill = monthlyBillRepository.findById(billId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn!"));
        // Map pending_approval (frontend) to pending_confirm (DB) if needed
        String dbStatus = status;
        if ("pending_approval".equalsIgnoreCase(status)) {
            dbStatus = "pending_confirm";
        }
        bill.setStatus(dbStatus);
        if (paymentProofUrl != null) {
            bill.setPaymentProofUrl(paymentProofUrl);
        }
        if ("paid".equalsIgnoreCase(dbStatus)) {
            bill.setPaidAt(java.time.LocalDateTime.now());
        }
        return monthlyBillRepository.save(bill);
    }

    private java.util.List<BillResponse> mapToBillResponses(java.util.List<MonthlyBill> bills) {
        java.util.List<BillResponse> responses = new java.util.ArrayList<>();
        for (MonthlyBill bill : bills) {
            java.util.Optional<Record> recordOpt = recordRepository.findById(bill.getRecordId());
            if (recordOpt.isPresent()) {
                Record record = recordOpt.get();
                String roomNum = "";
                java.util.Optional<Room> roomOpt = roomRepository.findById(record.getRoomId());
                if (roomOpt.isPresent()) {
                    roomNum = roomOpt.get().getRoomNumber();
                }

                Long ownerId = null;
                Long tenantId = null;
                java.util.Optional<com.trosmart.backend.entity.Contract> contractOpt = contractRepository.findById(record.getContractId());
                if (contractOpt.isPresent()) {
                    ownerId = contractOpt.get().getOwnerId();
                    tenantId = contractOpt.get().getTenantId();
                }

                responses.add(BillResponse.builder()
                        .billId(bill.getBillId())
                        .recordId(bill.getRecordId())
                        .billingDate(bill.getBillingDate())
                        .roomBill(bill.getRoomBill())
                        .elecBill(bill.getElecBill())
                        .waterBill(bill.getWaterBill())
                        .amenityBill(bill.getAmenityBill())
                        .totalAmount(bill.getTotalAmount())
                        .paymentProofUrl(bill.getPaymentProofUrl())
                        .status(bill.getStatus())
                        .paidAt(bill.getPaidAt())
                        .createdAt(bill.getCreatedAt())
                        .billingMonth(record.getBillingMonth())
                        .billingYear(record.getBillingYear())
                        .elecPrevious(record.getElecPrevious())
                        .elecCurrent(record.getElecCurrent())
                        .waterPrevious(record.getWaterPrevious())
                        .waterCurrent(record.getWaterCurrent())
                        .elecAmount(record.getElecAmount())
                        .waterAmount(record.getWaterAmount())
                        .roomNumber(roomNum)
                        .ownerId(ownerId)
                        .tenantId(tenantId)
                        .build());
            }
        }
        return responses;
    }

    public BillResponse getBillById(Long id) {
        MonthlyBill bill = monthlyBillRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn!"));
        
        java.util.List<MonthlyBill> list = new java.util.ArrayList<>();
        list.add(bill);
        java.util.List<BillResponse> responses = mapToBillResponses(list);
        if (responses.isEmpty()) {
            throw new RuntimeException("Lỗi nạp dữ liệu chi tiết hóa đơn!");
        }
        return responses.get(0);
    }

    public java.util.Optional<MonthlyBill> findExistingBill(Long roomId, Integer month, Integer year) {
        return recordRepository.findByRoomIdAndBillingMonthAndBillingYear(roomId, month, year)
                .flatMap(record -> monthlyBillRepository.findByRecordId(record.getRecordId()).stream().findFirst());
    }

    @Transactional
    public String uploadProof(MultipartFile file) throws java.io.IOException {
        return fileStorageUtil.store(file, "proofs");
    }
}

