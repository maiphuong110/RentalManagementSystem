package com.trosmart.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "Monthly_Bill")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MonthlyBill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "bill_id")
    private Long billId;

    @Column(name = "record_id", nullable = false)
    private Long recordId;

    @Column(name = "billing_date", nullable = false)
    private LocalDate billingDate;

    @Column(name = "room_bill", nullable = false, precision = 12, scale = 2)
    private BigDecimal roomBill;

    @Column(name = "elec_bill", nullable = false, precision = 12, scale = 2)
    private BigDecimal elecBill;

    @Column(name = "water_bill", nullable = false, precision = 12, scale = 2)
    private BigDecimal waterBill;

    // Note: the DB table `Monthly_Bill` does not store elec_amount/water_amount separately -
    // we compute usage from Record when generating the bill and persist only the monetary values.

    @Column(name = "amenity_bill", nullable = false, precision = 12, scale = 2)
    private BigDecimal amenityBill;

    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "payment_proof_url", length = 500)
    private String paymentProofUrl;

    @Column(nullable = false, length = 50)
    private String status; // 'unpaid', 'pending_approval', 'paid', 'overdue'

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) this.status = "unpaid";
    }
}