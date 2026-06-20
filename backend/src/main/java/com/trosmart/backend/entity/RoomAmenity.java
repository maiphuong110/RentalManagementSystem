package com.trosmart.backend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "room_amenity")
public class RoomAmenity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "room_amenity_id")
    private Long roomAmenityId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "amenity_id", nullable = false)
    private Amenity amenity;

    @Column(name = "monthly_fee", nullable = false, precision = 8, scale = 0)
    private BigDecimal monthlyFee = BigDecimal.ZERO;

    // --- GETTERS AND SETTERS ---

    public Long getRoomAmenityId() { return roomAmenityId; }
    public void setRoomAmenityId(Long roomAmenityId) { this.roomAmenityId = roomAmenityId; }

    public Room getRoom() { return room; }
    public void setRoom(Room room) { this.room = room; }

    public Amenity getAmenity() { return amenity; }
    public void setAmenity(Amenity amenity) { this.amenity = amenity; }

    public BigDecimal getMonthlyFee() { return monthlyFee; }
    public void setMonthlyFee(BigDecimal monthlyFee) { this.monthlyFee = monthlyFee; }
}