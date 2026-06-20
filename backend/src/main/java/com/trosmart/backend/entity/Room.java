package com.trosmart.backend.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "room")
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "room_id")
    private Long roomId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @Column(name = "room_number", nullable = false, length = 20)
    private String roomNumber;

    @Column(name = "area_sqm", nullable = false, precision = 5, scale = 2)
    private BigDecimal areaSqm;

    @Column(name = "max_capacity", nullable = false, columnDefinition = "TINYINT")
    private Integer maxCapacity;

    @Column(name = "base_price", precision = 12, scale = 0)
    private BigDecimal basePrice;

    @Column(name = "elec_price_kwh", precision = 8, scale = 0)
    private BigDecimal elecPriceKwh;

    @Column(name = "water_price_m3", precision = 8, scale = 0)
    private BigDecimal waterPriceM3;

    @Enumerated(EnumType.STRING)
    @Column(name = "elec_kind", columnDefinition = "VARCHAR(50)")
    private ElecKind elecKind;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoomStatus status = RoomStatus.available;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "room", fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    private List<RoomAmenity> roomAmenities;

    @Column(name = "bedrooms", nullable = false, columnDefinition = "TINYINT DEFAULT 1")
    private Integer bedrooms = 1;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
    // --- GETTERS AND SETTERS ---

    public Long getRoomId() { return roomId; }
    public void setRoomId(Long roomId) { this.roomId = roomId; }

    public Property getProperty() { return property; }
    public void setProperty(Property property) { this.property = property; }

    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }

    public BigDecimal getAreaSqm() { return areaSqm; }
    public void setAreaSqm(BigDecimal areaSqm) { this.areaSqm = areaSqm; }

    public Integer getMaxCapacity() { return maxCapacity; }
    public void setMaxCapacity(Integer maxCapacity) { this.maxCapacity = maxCapacity; }

    public BigDecimal getBasePrice() { return basePrice; }
    public void setBasePrice(BigDecimal basePrice) { this.basePrice = basePrice; }

    public BigDecimal getElecPriceKwh() { return elecPriceKwh; }
    public void setElecPriceKwh(BigDecimal elecPriceKwh) { this.elecPriceKwh = elecPriceKwh; }

    public BigDecimal getWaterPriceM3() { return waterPriceM3; }
    public void setWaterPriceM3(BigDecimal waterPriceM3) { this.waterPriceM3 = waterPriceM3; }

    public ElecKind getElecKind() { return elecKind; }
    public void setElecKind(ElecKind elecKind) { this.elecKind = elecKind; }

    public RoomStatus getStatus() { return status; }
    public void setStatus(RoomStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public List<RoomAmenity> getRoomAmenities() { return roomAmenities; }
    public void setRoomAmenities(List<RoomAmenity> roomAmenities) { this.roomAmenities = roomAmenities; }

    public LocalDateTime getDeletedAt() { return deletedAt;     }

    public void setDeletedAt(LocalDateTime deletedAt) { this.deletedAt = deletedAt; }

    public Integer getBedrooms() { return bedrooms; }
    public void setBedrooms(Integer bedrooms) { this.bedrooms = bedrooms; }
}