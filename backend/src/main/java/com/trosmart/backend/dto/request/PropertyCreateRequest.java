package com.trosmart.backend.dto.request;

import com.trosmart.backend.entity.PropertyType;
import java.math.BigDecimal;

public class PropertyCreateRequest {

    private Long ownerId;
    private String name;
    private String street;
    private String ward;
    private String district;
    private String city;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private PropertyType type;

    public Long getOwnerId() {return ownerId;}
    public void setOwnerId(Long ownerId) {this.ownerId = ownerId;}
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getStreet() { return street; }
    public void setStreet(String street) { this.street = street; }
    public String getWard() { return ward; }
    public void setWard(String ward) { this.ward = ward; }
    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }
    public BigDecimal getLatitude() { return latitude; }
    public void setLatitude(BigDecimal latitude) { this.latitude = latitude; }
    public BigDecimal getLongitude() { return longitude; }
    public void setLongitude(BigDecimal longitude) { this.longitude = longitude; }
    public PropertyType getType() { return type; }
    public void setType(PropertyType type) { this.type = type; }
}