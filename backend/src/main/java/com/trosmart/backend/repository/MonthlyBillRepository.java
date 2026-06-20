package com.trosmart.backend.repository;

import com.trosmart.backend.entity.MonthlyBill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MonthlyBillRepository extends JpaRepository<MonthlyBill, Long> {
    List<MonthlyBill> findByRecordId(Long recordId);
    List<MonthlyBill> findByStatus(String status); // Phục vụ hiển thị phòng nợ tiền trên Dashboard (UR-L056)

    @org.springframework.data.jpa.repository.Query("SELECT mb FROM MonthlyBill mb WHERE mb.recordId IN (SELECT r.recordId FROM Record r WHERE r.contractId IN (SELECT c.contractId FROM Contract c WHERE c.tenantId = :tenantId)) ORDER BY mb.billId DESC")
    List<MonthlyBill> findByTenantId(@org.springframework.data.repository.query.Param("tenantId") Long tenantId);

    @org.springframework.data.jpa.repository.Query("SELECT mb FROM MonthlyBill mb WHERE mb.recordId IN (SELECT r.recordId FROM Record r WHERE r.roomId = :roomId) ORDER BY mb.billId DESC")
    List<MonthlyBill> findByRoomId(@org.springframework.data.repository.query.Param("roomId") Long roomId);
}