package com.supermarket.cashregister.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.supermarket.cashregister.model.CashMovementType;

public record CashRegisterMovementDTO(
		Long id,
		Long sessionId,
		Long userId,
		String userName,
		CashMovementType type,
		BigDecimal amount,
		String reason,
		LocalDateTime createdAt) {
}
