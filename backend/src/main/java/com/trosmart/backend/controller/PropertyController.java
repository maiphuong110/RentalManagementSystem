package com.trosmart.backend.controller;

import com.trosmart.backend.dto.request.PropertyCreateRequest;
import com.trosmart.backend.dto.request.PropertyUpdateRequest;
import com.trosmart.backend.service.PropertyService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/properties")
public class PropertyController {

    // Tiêm (Inject) bộ phận xử lý nghiệp vụ vào Controller
    // Lỗi đỏ ở đây là bình thường vì mình chưa tạo interface PropertyService
    private final PropertyService propertyService;

    public PropertyController(PropertyService propertyService) {
        this.propertyService = propertyService;
    }

    // 1. API Lấy danh sách tất cả khu trọ của một chủ trọ
    @GetMapping
    public ResponseEntity<?> getAllProperties(@RequestParam Long ownerId) {
        // Thực tế sau này ownerId sẽ lấy từ Token đăng nhập, tạm thời truyền qua tham số
        return ResponseEntity.ok(propertyService.getAllPropertiesByOwner(ownerId));
    }

    // 2. API Lấy chi tiết một khu trọ theo ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getPropertyById(@PathVariable Long id) {
        return ResponseEntity.ok(propertyService.getPropertyById(id));
    }

    // 3. API Tạo mới một khu trọ
    // Dùng DTO (PropertyCreateRequest) thay vì Entity Property để nhận dữ liệu
    @PostMapping
    public ResponseEntity<?> createProperty(@RequestBody PropertyCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(propertyService.createProperty(request));
    }

    // 4. API Cập nhật thông tin khu trọ
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProperty(@PathVariable Long id, @RequestBody PropertyUpdateRequest request) {
        return ResponseEntity.ok(propertyService.updateProperty(id, request));
    }

    // 5. API Xóa (hoặc ẩn) khu trọ
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProperty(@PathVariable Long id) {
        propertyService.deleteProperty(id);
        return ResponseEntity.noContent().build();
    }

    // 6. API Lấy danh sách tiện ích của một khu trọ
    @GetMapping("/{id}/amenities")
    public ResponseEntity<?> getAmenitiesByPropertyId(@PathVariable Long id) {
        return ResponseEntity.ok(propertyService.getAmenitiesByPropertyId(id));
    }
}