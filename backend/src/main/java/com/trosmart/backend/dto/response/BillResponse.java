package com.trosmart.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BillResponse {
    private Long billId;
    private Long recordId;
    private LocalDate billingDate;
    private BigDecimal roomBill;
    private BigDecimal elecBill;
    private BigDecimal waterBill;
    private BigDecimal amenityBill;
    private BigDecimal totalAmount;
    private String paymentProofUrl;
    private String status;
    private LocalDateTime paidAt;
    private LocalDateTime createdAt;
    
    // Details from Record
    private Integer billingMonth;
    private Integer billingYear;
    private BigDecimal elecPrevious;
    private BigDecimal elecCurrent;
    private BigDecimal waterPrevious;
    private BigDecimal waterCurrent;
    private BigDecimal elecAmount;
    private BigDecimal waterAmount;
    
    // Room number info
    private String roomNumber;

    // Party IDs
    private Long ownerId;
    private Long tenantId;
}
