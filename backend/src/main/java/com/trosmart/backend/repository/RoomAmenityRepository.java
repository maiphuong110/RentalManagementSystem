package com.trosmart.backend.repository;

import com.trosmart.backend.entity.RoomAmenity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface RoomAmenityRepository extends JpaRepository<RoomAmenity, Long> {

    void deleteAllByRoom_RoomId(Long roomId);
    List<RoomAmenity> findByRoomRoomId(Long roomId);

    @Modifying
    @Transactional
    @Query("DELETE FROM RoomAmenity ra WHERE ra.room.roomId = :roomId AND ra.amenity.amenityId = :amenityId")
    void deleteByRoomIdAndAmenityId(@Param("roomId") Long roomId, @Param("amenityId") Long amenityId);
}