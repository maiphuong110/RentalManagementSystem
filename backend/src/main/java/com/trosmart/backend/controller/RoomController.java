package com.trosmart.backend.controller;

import com.trosmart.backend.dto.request.RoomAmenityPatchRequest;
import com.trosmart.backend.dto.request.RoomCreateRequest;
import com.trosmart.backend.dto.request.RoomUpdateRequest;
import com.trosmart.backend.dto.response.RoomResponse;
import com.trosmart.backend.service.RoomService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/rooms")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    // 1. API Tìm kiếm phòng (Dành cho Tenant)
    @GetMapping("/search")
    public ResponseEntity<?> searchRooms(
            @RequestParam(required = false) String district,
            @RequestParam(required = false) Long minPrice,
            @RequestParam(required = false) Long maxPrice,
            @RequestParam(required = false, defaultValue = "available") String status,
            @RequestParam(required = false) String type) {

        return ResponseEntity.ok(roomService.searchRooms(district, minPrice, maxPrice, status, type));
    }

    // 2. API Lấy danh sách phòng thuộc về 1 Khu trọ cụ thể (Dành cho Chủ trọ)
    @GetMapping("/property/{propertyId}")
    public ResponseEntity<?> getRoomsByProperty(@PathVariable Long propertyId) {
        return ResponseEntity.ok(roomService.getRoomsByPropertyId(propertyId));
    }

    // 3. API Lấy chi tiết 1 phòng
    @GetMapping("/{id}")
    public ResponseEntity<?> getRoomById(@PathVariable Long id) {
        return ResponseEntity.ok(roomService.getRoomById(id));
    }

    // 4. API Thêm phòng mới vào một khu trọ
    @PostMapping
    public ResponseEntity<?> createRoom(@RequestBody RoomCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(roomService.createRoom(request));
    }

    // 5. API Cập nhật toàn bộ thông tin phòng
    @PutMapping("/{id}")
    public ResponseEntity<?> updateRoom(@PathVariable Long id, @RequestBody RoomUpdateRequest request) {
        return ResponseEntity.ok(roomService.updateRoom(id, request));
    }

    // 6. API Đổi trạng thái phòng nhanh
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateRoomStatus(@PathVariable Long id, @RequestParam String newStatus) {
        roomService.updateRoomStatus(id, newStatus);
        return ResponseEntity.ok().body("Cập nhật trạng thái thành công!");
    }

    // 5b. API Lắp thêm tiện ích hoặc cập nhật giá tiện ích
    @PatchMapping("/{id}/amenities")
    public ResponseEntity<?> patchAmenityForRoom(@PathVariable Long id, @RequestBody RoomAmenityPatchRequest request) {
        return ResponseEntity.ok(roomService.patchAmenityForRoom(id, request));
    }

    // API Xóa 1 tiện ích khỏi phòng
    @DeleteMapping("/{roomId}/amenities/{amenityId}")
    public ResponseEntity<RoomResponse> removeAmenityFromRoom(
            @PathVariable Long roomId,
            @PathVariable Long amenityId) {

        RoomResponse updatedRoom = roomService.removeAmenityFromRoom(roomId, amenityId);
        return ResponseEntity.ok(updatedRoom);
    }

    // Gọi endpoint này để đánh dấu xóa phòng, không làm mất mát hóa đơn/hợp đồng lịch sử
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRoom(@PathVariable Long id) {
        roomService.deleteRoomSoft(id); // Gọi hàm xóa mềm bên tầng Service
        return ResponseEntity.ok().body("Xóa phòng trọ ID " + id + " thành công!");    }

    // API Lấy danh sách tiện ích của 1 phòng cụ thể
    @GetMapping("/{id}/amenities")
    public ResponseEntity<?> getAmenitiesByRoomId(@PathVariable Long id) {
        return ResponseEntity.ok(roomService.getAmenitiesByRoomId(id));
    }


}