package com.supermarket.cashregister.dto;

import java.time.LocalDateTime;

public record PhysicalCashRegisterStatusDTO(
		Long id,
		String name,
		String status,
		String description,
		LocalDateTime createdAt,
		boolean occupied,
		Long activeSessionId,
		String activeCashierName) {
}
