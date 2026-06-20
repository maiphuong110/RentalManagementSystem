package com.trosmart.backend.dto.request;

import java.math.BigDecimal;

/**
 * Dùng cho endpoint PATCH /api/v1/rooms/{roomId}/amenities
 * - Upsert 1 tiện ích vào phòng hoặc cập nhật monthlyFee nếu đã tồn tại.
 */
public class RoomAmenityPatchRequest {
    private Long amenityId;
    private BigDecimal monthlyFee;

    public Long getAmenityId() {
        return amenityId;
    }

    public void setAmenityId(Long amenityId) {
        this.amenityId = amenityId;
    }

    public BigDecimal getMonthlyFee() {
        return monthlyFee;
    }

    public void setMonthlyFee(BigDecimal monthlyFee) {
        this.monthlyFee = monthlyFee;
    }
}

