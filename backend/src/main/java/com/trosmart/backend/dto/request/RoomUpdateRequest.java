package com.trosmart.backend.dto.request;
import com.trosmart.backend.entity.ElecKind;
import com.trosmart.backend.entity.RoomStatus;
import java.math.BigDecimal;

public class RoomUpdateRequest {
    private String roomNumber;
    private BigDecimal areaSqm;
    private Integer maxCapacity;
    private BigDecimal basePrice;
    private BigDecimal elecPriceKwh;
    private BigDecimal waterPriceM3;
    private ElecKind elecKind;
    private RoomStatus status;
    private Integer bedrooms;

    public BigDecimal getElecPriceKwh() {
        return elecPriceKwh;
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public BigDecimal getAreaSqm() {
        return areaSqm;
    }

    public Integer getMaxCapacity() {
        return maxCapacity;
    }

    public BigDecimal getBasePrice() {
        return basePrice;
    }

    public BigDecimal getWaterPriceM3() {
        return waterPriceM3;
    }

    public ElecKind getElecKind() {
        return elecKind;
    }

    public RoomStatus getStatus() {
        return status;
    }

    public void setAreaSqm(BigDecimal areaSqm) {
        this.areaSqm = areaSqm;
    }

    public void setMaxCapacity(Integer maxCapacity) {
        this.maxCapacity = maxCapacity;
    }

    public void setBasePrice(BigDecimal basePrice) {
        this.basePrice = basePrice;
    }

    public void setElecPriceKwh(BigDecimal elecPriceKwh) {
        this.elecPriceKwh = elecPriceKwh;
    }

    public void setWaterPriceM3(BigDecimal waterPriceM3) {
        this.waterPriceM3 = waterPriceM3;
    }

    public void setElecKind(ElecKind elecKind) {
        this.elecKind = elecKind;
    }

    public void setStatus(RoomStatus status) {
        this.status = status;
    }

    public Integer getBedrooms() {
        return bedrooms;
    }

    public void setBedrooms(Integer bedrooms) {
        this.bedrooms = bedrooms;
    }
}
