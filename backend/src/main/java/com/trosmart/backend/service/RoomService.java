package com.trosmart.backend.service;

import com.trosmart.backend.dto.request.RoomAmenityPatchRequest;
import com.trosmart.backend.dto.request.RoomCreateRequest;
import com.trosmart.backend.dto.request.RoomUpdateRequest;
import com.trosmart.backend.dto.response.RoomResponse;
import java.util.List;

public interface RoomService {
    List<RoomResponse> searchRooms(String district, Long minPrice, Long maxPrice, String status, String type);
    List<RoomResponse> getRoomsByPropertyId(Long propertyId);
    RoomResponse getRoomById(Long id);
    List<?> getAmenitiesByRoomId(Long roomId);
    RoomResponse createRoom(RoomCreateRequest request);
    RoomResponse updateRoom(Long id, RoomUpdateRequest request);
    RoomResponse patchAmenityForRoom(Long roomId, RoomAmenityPatchRequest request);
    RoomResponse removeAmenityFromRoom(Long roomId, Long amenityId);
    void updateRoomStatus(Long id, String newStatus);
    void deleteRoomSoft(Long roomId);
    void deletePropertySoft(Long propertyId);
}