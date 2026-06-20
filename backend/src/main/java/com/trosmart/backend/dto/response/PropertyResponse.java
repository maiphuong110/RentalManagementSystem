package com.trosmart.backend.dto.response;

import com.trosmart.backend.entity.Property;
import com.trosmart.backend.entity.PropertyType;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PropertyResponse {
    private Long propertyId;
    private Long ownerId;
    private String name;
    private String street;
    private String ward;
    private String district;
    private String city;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private PropertyType type;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Hàm tiện ích để biến Entity thành DTO cực nhanh
    public static PropertyResponse fromEntity(Property property) {
        PropertyResponse res = new PropertyResponse();
        res.setPropertyId(property.getPropertyId());
        res.setOwnerId(property.getOwnerId());
        res.setName(property.getName());
        res.setStreet(property.getStreet());
        res.setWard(property.getWard());
        res.setDistrict(property.getDistrict());
        res.setCity(property.getCity());
        res.setLatitude(property.getLatitude());
        res.setLongitude(property.getLongitude());
        res.setType(property.getType());
        res.setIsActive(property.getIsActive());
        res.setCreatedAt(property.getCreatedAt());
        res.setUpdatedAt(property.getUpdatedAt());
        return res;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getStreet() {
        return street;
    }

    public void setStreet(String street) {
        this.street = street;
    }

    public String getWard() {
        return ward;
    }

    public void setWard(String ward) {
        this.ward = ward;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public BigDecimal getLatitude() {
        return latitude;
    }

    public void setLatitude(BigDecimal latitude) {
        this.latitude = latitude;
    }

    public BigDecimal getLongitude() {
        return longitude;
    }

    public void setLongitude(BigDecimal longitude) {
        this.longitude = longitude;
    }

    public PropertyType getType() {
        return type;
    }

    public void setType(PropertyType type) {
        this.type = type;
    }

    public Boolean getIsActive() {
        return isActive;
    }
    public void setIsActive(Boolean active) {
        isActive = active;
    }

    public Long getPropertyId() {
        return propertyId;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public Long getOwnerId() {
        return ownerId;
    }

    public void setPropertyId(Long propertyId) {
        this.propertyId = propertyId;
    }

    public void setOwnerId(Long ownerId) {
        this.ownerId = ownerId;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}