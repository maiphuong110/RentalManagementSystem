package com.trosmart.backend.dto.response;

import com.trosmart.backend.entity.ElecKind;
import com.trosmart.backend.entity.Room;
import com.trosmart.backend.entity.RoomStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class RoomResponse {
    private Long roomId;
    private Long propertyId;
    private String propertyName; // Gửi kèm tên khu trọ để Frontend dễ hiển thị
    private String roomNumber;
    private BigDecimal areaSqm;
    private Integer maxCapacity;
    private BigDecimal basePrice;
    private BigDecimal elecPriceKwh;
    private BigDecimal waterPriceM3;
    private ElecKind elecKind;
    private RoomStatus status;
    private Integer bedrooms;
    private LocalDateTime createdAt;

    // Danh sách tiện ích đã được map sang DTO
    private List<RoomAmenityResponse> amenities;

    public static RoomResponse fromEntity(com.trosmart.backend.entity.Room room) {
        RoomResponse res = new RoomResponse();
        res.setRoomId(room.getRoomId());
        res.setRoomNumber(room.getRoomNumber());
        res.setAreaSqm(room.getAreaSqm());
        res.setMaxCapacity(room.getMaxCapacity());
        res.setBedrooms(room.getBedrooms());
        res.setElecPriceKwh(room.getElecPriceKwh()); // Tiền điện tính theo số kwh giữ nguyên
        res.setStatus(room.getStatus());
        res.setCreatedAt(room.getCreatedAt());

        // 1. Tránh lỗi null nếu phòng chưa được gán vào tòa nhà (Property)
        if (room.getProperty() != null) {
            res.setPropertyId(room.getProperty().getPropertyId());
            res.setPropertyName(room.getProperty().getName());

            // 🔥 LOGIC OVERRIDE 1: Tiền phòng (Base Price)
            if (room.getBasePrice() != null) {
                res.setBasePrice(room.getBasePrice()); // Sử dụng giá riêng của phòng
            } else {
                res.setBasePrice(room.getProperty().getBasePrice()); // Kế thừa giá mặc định của tòa nhà
            }

            // 🔥 LOGIC OVERRIDE 2: Tiền nước (Water Price)
            if (room.getWaterPriceM3() != null) {
                res.setWaterPriceM3(room.getWaterPriceM3()); // Sử dụng giá riêng của phòng
            } else {
                res.setWaterPriceM3(room.getProperty().getWaterPriceM3()); // Kế thừa giá mặc định của tòa nhà
            }

            // 🔥 LOGIC OVERRIDE 3: Hình thức dùng điện (Elec Kind)
            if (room.getElecKind() != null) {
                res.setElecKind(room.getElecKind()); // Sử dụng cấu hình riêng của phòng
            } else {
                // Do elecKind dưới DB của Properties dùng ENUM, ta cần chuyển sang String/Enum tương ứng tùy DTO của bạn
                // Ở đây gán trực tiếp hoặc dùng .name() nếu res.setElecKind nhận String:
                res.setElecKind(room.getProperty().getElecKind());
            }
        } else {
            // Phòng đứng độc lập thì giữ nguyên giá gốc của phòng (dù có thể là null)
            res.setBasePrice(room.getBasePrice());
            res.setWaterPriceM3(room.getWaterPriceM3());
            res.setElecKind(room.getElecKind());
        }

        // 2. Xử lý danh sách tiện ích (Amenities) trả về mảng rỗng [] thay vì null
        if (room.getRoomAmenities() != null && !room.getRoomAmenities().isEmpty()) {
            List<RoomAmenityResponse> amenityResponses = room.getRoomAmenities().stream()
                    .map(RoomAmenityResponse::fromEntity)
                    .collect(Collectors.toList());
            res.setAmenities(amenityResponses);
        } else {
            res.setAmenities(new java.util.ArrayList<>());
        }

        return res;
    }

    public String getPropertyName() {
        return propertyName;
    }

    public void setPropertyName(String propertyName) {
        this.propertyName = propertyName;
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }

    public BigDecimal getAreaSqm() {
        return areaSqm;
    }

    public void setAreaSqm(BigDecimal areaSqm) {
        this.areaSqm = areaSqm;
    }

    public Integer getMaxCapacity() {
        return maxCapacity;
    }

    public void setMaxCapacity(Integer maxCapacity) {
        this.maxCapacity = maxCapacity;
    }

    public BigDecimal getBasePrice() {
        return basePrice;
    }

    public void setBasePrice(BigDecimal basePrice) {
        this.basePrice = basePrice;
    }

    public BigDecimal getElecPriceKwh() {
        return elecPriceKwh;
    }

    public void setElecPriceKwh(BigDecimal elecPriceKwh) {
        this.elecPriceKwh = elecPriceKwh;
    }

    public BigDecimal getWaterPriceM3() {
        return waterPriceM3;
    }

    public void setWaterPriceM3(BigDecimal waterPriceM3) {
        this.waterPriceM3 = waterPriceM3;
    }

    public ElecKind getElecKind() {
        return elecKind;
    }

    public void setElecKind(ElecKind elecKind) {
        this.elecKind = elecKind;
    }

    public RoomStatus getStatus() {
        return status;
    }

    public void setStatus(RoomStatus status) {
        this.status = status;
    }

    public Long getRoomId() {
        return roomId;
    }

    public List<RoomAmenityResponse> getAmenities() {
        return amenities;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public Long getPropertyId() {
        return propertyId;
    }

    public void setRoomId(Long roomId) {
        this.roomId = roomId;
    }

    public void setPropertyId(Long propertyId) {
        this.propertyId = propertyId;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setAmenities(List<RoomAmenityResponse> amenities) {
        this.amenities = amenities;
    }

    public Integer getBedrooms() {
        return bedrooms;
    }

    public void setBedrooms(Integer bedrooms) {
        this.bedrooms = bedrooms;
    }
}