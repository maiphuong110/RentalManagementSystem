package com.trosmart.backend.dto.response;

import com.trosmart.backend.entity.Amenity;

public class AmenityResponse {
    private Long amenityId;
    private String name;
    private String icon;

    public static AmenityResponse fromEntity(Amenity amenity) {
        AmenityResponse res = new AmenityResponse();
        res.setAmenityId(amenity.getAmenityId());
        res.setName(amenity.getName());
        res.setIcon(amenity.getIcon());
        return res;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
     }

    public Long getAmenityId() {
        return amenityId;
    }

    public void setAmenityId(Long amenityId) {
        this.amenityId = amenityId;
    }
}