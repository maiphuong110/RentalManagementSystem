package com.trosmart.backend.service.impl;

import com.trosmart.backend.dto.request.AmenityRequest;
import com.trosmart.backend.dto.response.AmenityResponse;
import com.trosmart.backend.entity.Amenity;
import com.trosmart.backend.repository.AmenityRepository;
import com.trosmart.backend.service.AmenityService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AmenityServiceImpl implements AmenityService {

    private final AmenityRepository amenityRepository;

    public AmenityServiceImpl(AmenityRepository amenityRepository) {
        this.amenityRepository = amenityRepository;
    }

    @Override
    public List<AmenityResponse> getAllAmenities() {
        return amenityRepository.findAll().stream()
                .filter(a -> a.getDeletedAt() == null) // Lọc bỏ amenity đã xóa mềm
                .map(AmenityResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public AmenityResponse getAmenityById(Long id) {
        Amenity amenity = amenityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tiện ích với ID: " + id));

        // Kiểm tra amenity đã bị xóa mềm hay không
        if (amenity.getDeletedAt() != null) {
            throw new RuntimeException("Tiện ích này đã bị xóa!");
        }
        return AmenityResponse.fromEntity(amenity);
    }

    @Override
    public AmenityResponse createAmenity(AmenityRequest request) {
        Amenity amenity = new Amenity();
        amenity.setName(request.getName());
        amenity.setIcon(request.getIcon());

        Amenity savedAmenity = amenityRepository.save(amenity);
        return AmenityResponse.fromEntity(savedAmenity);
    }

    @Override
    @Transactional
    public AmenityResponse updateAmenity(Long id, AmenityRequest request) {
        Amenity amenity = amenityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tiện ích với ID: " + id));

        // Chặn update nếu amenity đã bị xóa mềm
        if (amenity.getDeletedAt() != null) {
            throw new RuntimeException("Không thể cập nhật tiện ích đã bị xóa!");
        }

        amenity.setName(request.getName());
        amenity.setIcon(request.getIcon());

        Amenity updatedAmenity = amenityRepository.save(amenity);
        return AmenityResponse.fromEntity(updatedAmenity);
    }

    @Override
    @Transactional
    public void deleteAmenity(Long id) {
        Amenity amenity = amenityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tiện ích với ID: " + id));

        // Áp dụng soft delete thay vì hard delete
        amenity.setDeletedAt(LocalDateTime.now());
        amenityRepository.save(amenity);
    }
}