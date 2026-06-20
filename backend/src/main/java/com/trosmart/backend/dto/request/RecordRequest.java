package com.trosmart.backend.dto.request;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
public class RecordRequest {
    private Long roomId;
    private Integer billingMonth;
    private Integer billingYear;
    private BigDecimal elecOld;
    private BigDecimal elecNew;
    private BigDecimal waterOld;
    private BigDecimal waterNew;
    private BigDecimal appliedElecPrice;  // Đây là tiền 1 số điện (nếu có)
    private BigDecimal appliedWaterPrice; // Đây là tiền 1 số nước

    // THÊM TRƯỜNG NÀY VÀO LÀ XONG BON BON LUÔN:
    private BigDecimal appliedNormalPrice; // Cục tiền điện giá dân chủ nhà nhập thẳng
}