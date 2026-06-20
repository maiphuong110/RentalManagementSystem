package com.trosmart.backend.dto.request;
import com.trosmart.backend.entity.ElecKind;
import java.math.BigDecimal;
import java.util.List;

public class RoomCreateRequest {
    private Long propertyId;
    private String roomNumber;
    private BigDecimal areaSqm;
    private Integer maxCapacity;
    private BigDecimal basePrice;
    private BigDecimal elecPriceKwh;
    private BigDecimal waterPriceM3;
    private ElecKind elecKind;
    private Integer bedrooms;

    // Danh sách tiện ích đi kèm khi tạo phòng
    private List<RoomAmenityRequest> amenities;

    public BigDecimal getBasePrice() {
        return basePrice;
    }

    public Long getPropertyId() {
        return propertyId;
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

    public BigDecimal getElecPriceKwh() {
        return elecPriceKwh;
    }

    public BigDecimal getWaterPriceM3() {
        return waterPriceM3;
    }

    public ElecKind getElecKind() {
        return elecKind;
    }

    public List<RoomAmenityRequest> getAmenities() {
        return amenities;
    }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
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

    public Integer getBedrooms() {
        return bedrooms;
    }

    public void setBedrooms(Integer bedrooms) {
        this.bedrooms = bedrooms;
    }
}
