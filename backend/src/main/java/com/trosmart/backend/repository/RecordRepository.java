package com.trosmart.backend.repository;

import com.trosmart.backend.entity.Record;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RecordRepository extends JpaRepository<Record, Long> {
    // Tìm bản ghi số điện nước của phòng dựa theo tháng và năm tách rời
    Optional<Record> findByRoomIdAndBillingMonthAndBillingYear(Long roomId, Integer billingMonth, Integer billingYear);

    // Tìm bản ghi số điện nước mới nhất của phòng
    Optional<Record> findFirstByRoomIdOrderByBillingYearDescBillingMonthDesc(Long roomId);
}