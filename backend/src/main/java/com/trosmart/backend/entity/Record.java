package com.trosmart.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "Record")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Record {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "record_id")
    private Long recordId;

    @Column(name = "room_id", nullable = false)
    private Long roomId;

    @Column(name = "contract_id", nullable = false)
    private Long contractId;

    @Column(name = "billing_month", nullable = false)
    private Integer billingMonth;

    @Column(name = "billing_year", nullable = false)
    private Integer billingYear;

    @Column(name = "elec_previous", nullable = false, precision = 10, scale = 2)
    private BigDecimal elecPrevious;

    @Column(name = "elec_current", nullable = false, precision = 10, scale = 2)
    private BigDecimal elecCurrent;

    @Column(name = "elec_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal elecAmount;

    @Column(name = "water_previous", nullable = false, precision = 10, scale = 2)
    private BigDecimal waterPrevious;

    @Column(name = "water_current", nullable = false, precision = 10, scale = 2)
    private BigDecimal waterCurrent;

    @Column(name = "water_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal waterAmount;

    @Column(name = "applied_normal_price", precision = 15, scale = 2)
    private BigDecimal appliedNormalPrice;
}