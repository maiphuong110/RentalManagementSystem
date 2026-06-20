package com.trosmart.backend.service.impl;

import com.trosmart.backend.dto.request.RoomAmenityPatchRequest;
import com.trosmart.backend.dto.request.RoomAmenityRequest;
import com.trosmart.backend.dto.request.RoomCreateRequest;
import com.trosmart.backend.dto.request.RoomUpdateRequest;
import com.trosmart.backend.dto.response.AmenityResponse;
import com.trosmart.backend.dto.response.RoomResponse;
import com.trosmart.backend.entity.*;
import com.trosmart.backend.repository.AmenityRepository;
import com.trosmart.backend.repository.PropertyRepository;
import com.trosmart.backend.repository.RoomAmenityRepository;
import com.trosmart.backend.repository.RoomRepository;
import com.trosmart.backend.service.RoomService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@Service
public class RoomServiceImpl implements RoomService {

    private final RoomRepository roomRepository;
    private final PropertyRepository propertyRepository;
    private final AmenityRepository amenityRepository;
    private final RoomAmenityRepository roomAmenityRepository;

    public RoomServiceImpl(RoomRepository roomRepository, PropertyRepository propertyRepository,
                           AmenityRepository amenityRepository, RoomAmenityRepository roomAmenityRepository) {
        this.roomRepository = roomRepository;
        this.propertyRepository = propertyRepository;
        this.amenityRepository = amenityRepository;
        this.roomAmenityRepository = roomAmenityRepository;
    }

    @Override
    public List<RoomResponse> searchRooms(String district, Long minPrice, Long maxPrice, String status, String type) {
        List<Room> allRooms = roomRepository.findAll();

        return allRooms.stream()
                .filter(room -> room.getDeletedAt() == null) // chỉ lấy phòng chưa bị xóa mềm
                .filter(room -> status == null || room.getStatus().name().equalsIgnoreCase(status))
                .filter(room -> minPrice == null || room.getBasePrice().longValue() >= minPrice)
                .filter(room -> maxPrice == null || room.getBasePrice().longValue() <= maxPrice)
                .filter(room -> district == null || room.getProperty().getDistrict().toLowerCase().contains(district.toLowerCase()))
                .filter(room -> type == null || (room.getProperty() != null && room.getProperty().getType().toString().toLowerCase().contains(type.toLowerCase())))                .map(RoomResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public List<RoomResponse> getRoomsByPropertyId(Long propertyId) {
        return roomRepository.findAllByProperty_PropertyId(propertyId).stream()
                .filter(room -> room.getDeletedAt() == null)
                .peek(room -> {
                    // Mẹo nhỏ: Đánh thức Hibernate nạp dữ liệu thật của Property tránh lỗi Lazy Proxy
                    if (room.getProperty() != null) {
                        room.getProperty().getName(); // Trigger load dữ liệu
                    }
                })
                .map(RoomResponse::fromEntity)
                .collect(Collectors.toList());


    }

    @Override
    public RoomResponse getRoomById(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng với ID: " + id));
        // Kiểm tra phòng đã bị xóa mềm hay không
        if (room.getDeletedAt() != null) {
            throw new RuntimeException("Phòng này đã bị xóa!");
        }
        return RoomResponse.fromEntity(room);
    }

    // Nhớ inject thêm EntityManager ở đầu class nếu chưa có nha Viper:
    @PersistenceContext
    private EntityManager entityManager;

    @Override
    @Transactional
    public RoomResponse createRoom(RoomCreateRequest request) {
        // 1. Nạp tươi dữ liệu Property từ Database lên
        Property property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() -> new RuntimeException("Khu trọ không tồn tại!"));

        // Chặn tạo phòng nếu khu trọ đã bị xóa mềm
        if (property.getDeletedAt() != null) {
            throw new RuntimeException("Không thể thêm phòng vào khu trọ đã bị xóa!");
        }

        Room room = new Room();
        room.setProperty(property);
        room.setRoomNumber(request.getRoomNumber());
        room.setAreaSqm(request.getAreaSqm());
        room.setMaxCapacity(request.getMaxCapacity());
        if (request.getBedrooms() != null) {
            room.setBedrooms(request.getBedrooms());
        }

        // Gán giá trị thô từ Request xuống (DB nhận null nếu truyền null)
        room.setBasePrice(request.getBasePrice());
        room.setElecPriceKwh(request.getElecPriceKwh());
        room.setWaterPriceM3(request.getWaterPriceM3());
        room.setElecKind(request.getElecKind());
        room.setStatus(RoomStatus.available);

        // Khởi tạo sẵn một mảng rỗng trong Room entity để tí nữa nhét vào
        List<RoomAmenity> amenityList = new java.util.ArrayList<>();
        room.setRoomAmenities(amenityList);

        Room savedRoom = roomRepository.save(room);

        // 2. Xử lý logic chèn mớ Tiện ích (Amenities)
        if (request.getAmenities() != null) {
            for (RoomAmenityRequest amtReq : request.getAmenities()) {
                RoomAmenity roomAmenity = new RoomAmenity();
                roomAmenity.setRoom(savedRoom);

                Amenity amenity = amenityRepository.findById(amtReq.getAmenityId())
                        .orElseThrow(() -> new RuntimeException("Tiện ích với ID " + amtReq.getAmenityId() + " không tồn tại"));

                roomAmenity.setAmenity(amenity);
                roomAmenity.setMonthlyFee(amtReq.getMonthlyFee());

                // Lưu vào bảng trung gian
                roomAmenityRepository.save(roomAmenity);

                // ÉP ĐỒNG BỘ HAI CHIỀU TRONG RAM - Nhét thẳng vào list của savedRoom
                savedRoom.getRoomAmenities().add(roomAmenity);
            }
        }

        // 🔥 PHẪU THUẬT THẦN THÁNH Ở ĐÂY:
        // Lệnh flush() này sẽ ép Hibernate bắn ngay toàn bộ lệnh INSERT xuống MySQL.
        roomRepository.flush();

        // Lệnh refresh() này sẽ bắt Hibernate xóa sạch cache cũ trên RAM, đi xuống DB lôi lại bản ghi
        // tươi mới 100% lên (Nạp kèm toàn bộ data xịn của bảng Properties dán vào).
        entityManager.refresh(savedRoom);

        // Trả về map DTO luôn từ đối tượng savedRoom đã được refresh sạch sẽ dữ liệu kế thừa
        return RoomResponse.fromEntity(savedRoom);
    }

    @Override
    @Transactional
    public RoomResponse updateRoom(Long roomId, RoomUpdateRequest request) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng trọ với ID: " + roomId));

        room.setRoomNumber(request.getRoomNumber());
        room.setAreaSqm(request.getAreaSqm());
        room.setMaxCapacity(request.getMaxCapacity());
        if (request.getBedrooms() != null) {
            room.setBedrooms(request.getBedrooms());
        }
        room.setBasePrice(request.getBasePrice());
        room.setElecPriceKwh(request.getElecPriceKwh());
        room.setWaterPriceM3(request.getWaterPriceM3());
        room.setElecKind(request.getElecKind());
        if (request.getStatus() != null) {
            room.setStatus(request.getStatus());
        }

        Room updatedRoom = roomRepository.save(room);
        return RoomResponse.fromEntity(updatedRoom);
    }

    @Override
    @Transactional
    public RoomResponse patchAmenityForRoom(Long roomId, RoomAmenityPatchRequest request) {
        if (request == null || request.getAmenityId() == null) {
            throw new RuntimeException("amenityId là bắt buộc");
        }
        if (request.getMonthlyFee() == null) {
            throw new RuntimeException("monthlyFee là bắt buộc");
        }

        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng trọ với ID: " + roomId));

        // Chặn patch amenity nếu phòng đã bị xóa mềm
        if (room.getDeletedAt() != null) {
            throw new RuntimeException("Không thể cập nhật tiện ích của phòng đã bị xóa!");
        }

        Amenity amenity = amenityRepository.findById(request.getAmenityId())
                .orElseThrow(() -> new RuntimeException("Tiện ích với ID " + request.getAmenityId() + " không tồn tại"));

        // Tìm quan hệ hiện có trong DB
        List<RoomAmenity> current = roomAmenityRepository.findByRoomRoomId(roomId);
        Optional<RoomAmenity> existing = current.stream()
                .filter(ra -> ra.getAmenity() != null && ra.getAmenity().getAmenityId().equals(request.getAmenityId()))
                .findFirst();

        if (existing.isPresent()) {
            RoomAmenity ra = existing.get();
            ra.setMonthlyFee(request.getMonthlyFee());
            roomAmenityRepository.save(ra);
        } else {
            RoomAmenity ra = new RoomAmenity();
            ra.setRoom(room);
            ra.setAmenity(amenity);
            ra.setMonthlyFee(request.getMonthlyFee());
            roomAmenityRepository.save(ra);

            // đồng bộ list trong RAM (phòng hợp response map đúng)
            if (room.getRoomAmenities() != null) {
                room.getRoomAmenities().add(ra);
            }
        }

        // reload room để đảm bảo amenities (EAGER) cập nhật
        Room updated = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng trọ với ID: " + roomId));
        return RoomResponse.fromEntity(updated);
    }

    @Override
    public void updateRoomStatus(Long id, String newStatus) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng với ID: " + id));

        try {
            RoomStatus status = RoomStatus.valueOf(newStatus.toLowerCase());
            room.setStatus(status);
            roomRepository.save(room);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Trạng thái phòng không hợp lệ: " + newStatus + ". Các trạng thái hợp lệ: available, unavailable");
        }
    }

    @Override
    @Transactional
    public RoomResponse removeAmenityFromRoom(Long roomId, Long amenityId) {
        // 1. Kiểm tra phòng có tồn tại không
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng trọ!"));

        // 2. Gọi hàm xóa thẳng cánh cò bay dưới DB, bất chấp cache
        roomAmenityRepository.deleteByRoomIdAndAmenityId(roomId, amenityId);
        roomAmenityRepository.flush();

        // 3. Đồng bộ lại trên RAM để JSON trả về ngay lúc đó sạch sẽ
        if (room.getRoomAmenities() != null) {
            room.getRoomAmenities().removeIf(ra -> ra.getAmenity().getAmenityId().equals(amenityId));
        }

        // 4. Trả về thông tin phòng tươi mới
        return RoomResponse.fromEntity(room);
    }

    @Override
    @Transactional
    public void deleteRoomSoft(Long roomId) {
        System.out.println(">>> CHECK LOG: Da chay vao ham xoa mem voi ID: " + roomId);
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng trọ để xóa!"));

        // Chỉ đánh dấu mốc thời gian xóa chứ không gọi lệnh delete của repository
        room.setDeletedAt(java.time.LocalDateTime.now());
        roomRepository.save(room);
    }

    @Override
    @Transactional
    public void deletePropertySoft(Long propertyId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khu trọ để xóa!"));

        // 1. Xóa mềm khu trọ
        property.setDeletedAt(java.time.LocalDateTime.now());
        propertyRepository.save(property);

        // 2. Cascade bằng cơm: Tự động quét và xóa mềm toàn bộ phòng thuộc khu trọ này
        List<Room> rooms = roomRepository.findAllByProperty_PropertyId(propertyId);
        for (Room room : rooms) {
            room.setDeletedAt(java.time.LocalDateTime.now());
            roomRepository.save(room);
            roomRepository.flush();
        }
    }

    @Override
    public List<AmenityResponse> getAmenitiesByRoomId(Long roomId) {
        // 1. Kiểm tra xem phòng có tồn tại không (và chưa bị xóa mềm)
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng trọ ID: " + roomId));

        if (room.getDeletedAt() != null) {
            throw new RuntimeException("Phòng trọ này đã bị xóa!");
        }

        // 2. Lấy danh sách tiện ích của phòng này (Thông qua bảng trung gian RoomAmenity)
        // Giống hệt cách bạn đã query rất chuẩn bên PropertyServiceImpl
        List<RoomAmenity> roomAmenities = roomAmenityRepository.findByRoomRoomId(roomId);

        // 3. Biến đổi dữ liệu Entity thành DTO trả về cho Controller
        return roomAmenities.stream()
                .map(ra -> AmenityResponse.fromEntity(ra.getAmenity()))
                .collect(Collectors.toList());
    }
}
