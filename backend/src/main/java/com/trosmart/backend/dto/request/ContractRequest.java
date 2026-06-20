package com.trosmart.backend.dto.request;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class ContractRequest {
    private Long roomId;
    private Long tenantId;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal depositAmount;
    private BigDecimal rentPricePerMonth;
}