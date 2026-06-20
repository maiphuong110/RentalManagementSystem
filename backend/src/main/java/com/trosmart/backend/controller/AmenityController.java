package com.trosmart.backend.controller;

import com.trosmart.backend.dto.request.AmenityRequest;
import com.trosmart.backend.service.AmenityService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/amenities")
public class AmenityController {

    private final AmenityService amenityService;

    public AmenityController(AmenityService amenityService) {
        this.amenityService = amenityService;
    }

    @GetMapping
    public ResponseEntity<?> getAllAmenities() {
        return ResponseEntity.ok(amenityService.getAllAmenities());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getAmenityById(@PathVariable Long id) {
        return ResponseEntity.ok(amenityService.getAmenityById(id));
    }

    @PostMapping
    public ResponseEntity<?> createAmenity(@RequestBody AmenityRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(amenityService.createAmenity(request));
    }

    @PostMapping("/batch")
    public ResponseEntity<?> createAmenities(@RequestBody List<AmenityRequest> requests) {
        List<?> createdAmenities = requests.stream()
                .map(amenityService::createAmenity)
                .collect(Collectors.toList());

        return ResponseEntity.status(HttpStatus.CREATED).body(createdAmenities);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAmenity(@PathVariable Long id, @RequestBody AmenityRequest request) {
        return ResponseEntity.ok(amenityService.updateAmenity(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAmenity(@PathVariable Long id) {
        amenityService.deleteAmenity(id);
        return ResponseEntity.noContent().build();
    }

}