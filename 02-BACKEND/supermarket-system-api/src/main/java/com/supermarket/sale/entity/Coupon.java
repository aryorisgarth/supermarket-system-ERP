package com.supermarket.sale.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import com.supermarket.sale.model.CouponStatus;

@Entity
@Table(name = "coupons")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Size(max = 50)
    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @NotNull
    @Column(name = "original_amount", nullable = false, precision = 12, scale = 4)
    private BigDecimal originalAmount;

    @NotNull
    @Column(name = "remaining_balance", nullable = false, precision = 12, scale = 4)
    private BigDecimal remainingBalance;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private CouponStatus status = CouponStatus.ACTIVE;

    @Column(name = "expiration_date")
    private LocalDateTime expirationDate;

    @NotNull
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "used_at")
    private LocalDateTime usedAt;

    @Version
    @Column(nullable = false)
    private Long version;

    public boolean isExpired() {
        return expirationDate != null && expirationDate.isBefore(LocalDateTime.now());
    }
}
