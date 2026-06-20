package com.trosmart.backend.dto.request;
import java.math.BigDecimal;

public class RoomAmenityRequest {
    private Long amenityId;
    private BigDecimal monthlyFee;

    public BigDecimal getMonthlyFee() {
        return monthlyFee;
    }

    public Long getAmenityId() {
        return amenityId;
    }

    public void setMonthlyFee(BigDecimal monthlyFee) {
        this.monthlyFee = monthlyFee;
    }

}