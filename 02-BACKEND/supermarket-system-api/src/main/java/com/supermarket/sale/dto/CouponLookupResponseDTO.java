package com.supermarket.sale.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.supermarket.sale.model.CouponStatus;

public record CouponLookupResponseDTO(
		Long id,
		String code,
		BigDecimal remainingBalance,
		CouponStatus status,
		LocalDateTime expirationDate) {
}
