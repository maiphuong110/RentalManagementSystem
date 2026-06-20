package com.trosmart.backend.service;

import com.trosmart.backend.dto.request.PropertyCreateRequest;
import com.trosmart.backend.dto.request.PropertyUpdateRequest;
import com.trosmart.backend.dto.response.AmenityResponse;
import com.trosmart.backend.dto.response.PropertyResponse;
import java.util.List;

public interface PropertyService {
    List<PropertyResponse> getAllPropertiesByOwner(Long ownerId);
    PropertyResponse getPropertyById(Long id);
    PropertyResponse createProperty(PropertyCreateRequest request);
    PropertyResponse updateProperty(Long id, PropertyUpdateRequest request);
    void deleteProperty(Long id);
    List<AmenityResponse> getAmenitiesByPropertyId(Long propertyId);

}