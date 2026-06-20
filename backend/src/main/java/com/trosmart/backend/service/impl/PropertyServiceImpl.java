package com.trosmart.backend.service.impl;

import com.trosmart.backend.dto.request.PropertyCreateRequest;
import com.trosmart.backend.dto.request.PropertyUpdateRequest;
import com.trosmart.backend.dto.response.AmenityResponse;
import com.trosmart.backend.dto.response.PropertyResponse;
import com.trosmart.backend.entity.Property;
import com.trosmart.backend.entity.Room;
import com.trosmart.backend.entity.RoomAmenity;
import com.trosmart.backend.repository.PropertyRepository;
import com.trosmart.backend.repository.RoomAmenityRepository;
import com.trosmart.backend.repository.RoomRepository;
import com.trosmart.backend.service.PropertyService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PropertyServiceImpl implements PropertyService {

    private final PropertyRepository propertyRepository;
    private final RoomRepository roomRepository;
    private final RoomAmenityRepository roomAmenityRepository;

    public PropertyServiceImpl(PropertyRepository propertyRepository, RoomRepository roomRepository, RoomAmenityRepository roomAmenityRepository) {
        this.propertyRepository = propertyRepository;
        this.roomRepository = roomRepository;
        this.roomAmenityRepository = roomAmenityRepository;
    }

    @Override
    public List<PropertyResponse> getAllPropertiesByOwner(Long ownerId) {
        return propertyRepository.findAllByOwnerId(ownerId)
                .stream()
                .filter(p -> p.getDeletedAt() == null) // 🔥 Hàm GET check trường này cực chuẩn rồi nè!
                .map(PropertyResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public PropertyResponse getPropertyById(Long id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khu trọ với ID: " + id));

        // Nếu khu trọ đã bị xóa mềm thì không cho xem chi tiết nữa
        if (property.getDeletedAt() != null) {
            throw new RuntimeException("Khu trọ này đã ngừng kinh doanh!");
        }
        return PropertyResponse.fromEntity(property);
    }

    @Override
    @Transactional
    public PropertyResponse createProperty(PropertyCreateRequest request) {
        Property property = new Property();
        property.setOwnerId(request.getOwnerId());
        property.setName(request.getName());
        property.setStreet(request.getStreet());
        property.setWard(request.getWard());
        property.setDistrict(request.getDistrict());
        property.setCity(request.getCity());
        property.setType(request.getType());

        Property savedProperty = propertyRepository.save(property);
        return PropertyResponse.fromEntity(savedProperty);
    }

    @Override
    @Transactional
    public PropertyResponse updateProperty(Long id, PropertyUpdateRequest request) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khu trọ!"));

        // Chặn update nếu property đã bị xóa mềm
        if (property.getDeletedAt() != null) {
            throw new RuntimeException("Không thể cập nhật khu trọ đã bị xóa!");
        }

        property.setName(request.getName());
        property.setType(request.getType());

        Property updatedProperty = propertyRepository.save(property);
        return PropertyResponse.fromEntity(updatedProperty);
    }

    // 🔥 ĐÃ PHẪU THUẬT: Sửa lại đồng bộ mốc thời gian xóa mềm dứt điểm lỗi hiển thị!
    @Override
    @Transactional
    public void deleteProperty(Long id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khu trọ để xóa!"));

        LocalDateTime now = LocalDateTime.now();

        // 1. Đánh dấu mốc thời gian xóa mềm cho Khu trọ
        property.setDeletedAt(now);
        propertyRepository.save(property);

        // 2. Hiệu ứng domino: Tự động quét và xóa mềm toàn bộ phòng thuộc khu trọ này luôn
        List<Room> rooms = roomRepository.findAllByProperty_PropertyId(id);
        for (Room room : rooms) {
            room.setDeletedAt(now);
            roomRepository.save(room);
        }

        // 3. Ép xả bộ nhớ đệm xuống DB ngay lập tức để tránh lỗi cache trơ dữ liệu cũ
        propertyRepository.flush();
        roomRepository.flush();
    }

    @Override
    public List<AmenityResponse> getAmenitiesByPropertyId(Long propertyId) {
        List<Room> rooms = roomRepository.findAllByProperty_PropertyId(propertyId);
        HashSet<Long> amenityIds = new HashSet<>();
        List<AmenityResponse> amenities = new java.util.ArrayList<>();
        for (Room room : rooms) {
            // Chỉ lấy tiện ích của những phòng chưa bị xóa mềm
            if (room.getDeletedAt() == null) {
                List<RoomAmenity> roomAmenities = roomAmenityRepository.findByRoomRoomId(room.getRoomId());
                for (RoomAmenity ra : roomAmenities) {
                    if (ra.getAmenity() != null && amenityIds.add(ra.getAmenity().getAmenityId())) {
                        amenities.add(AmenityResponse.fromEntity(ra.getAmenity()));
                    }
                }
            }
        }
        return amenities;
    }
}