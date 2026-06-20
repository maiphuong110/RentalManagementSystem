package com.trosmart.backend.dto.response;

import com.trosmart.backend.entity.RoomAmenity;
import java.math.BigDecimal;

public class RoomAmenityResponse {
    private Long amenityId;
    private String name;
    private String icon;
    private BigDecimal monthlyFee;

    public static RoomAmenityResponse fromEntity(RoomAmenity roomAmenity) {
        RoomAmenityResponse res = new RoomAmenityResponse();
        res.setAmenityId(roomAmenity.getAmenity().getAmenityId());
        res.setName(roomAmenity.getAmenity().getName());
        res.setIcon(roomAmenity.getAmenity().getIcon());
        res.setMonthlyFee(roomAmenity.getMonthlyFee());
        return res;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public BigDecimal getMonthlyFee() {
        return monthlyFee;
    }

    public void setMonthlyFee(BigDecimal monthlyFee) {
        this.monthlyFee = monthlyFee;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public void setAmenityId(Long amenityId) {
        this.amenityId = amenityId;
    }

    public Long getAmenityId() {
        return amenityId;
    }
}