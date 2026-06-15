package com.supermarket.cashregister.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.supermarket.cashregister.model.SessionStatus;

public record CashRegisterSessionDTO(
		Long id,
		Long cashierId,
		String cashierName,
		LocalDateTime openedAt,
		LocalDateTime closedAt,
		BigDecimal openingBalance,
		BigDecimal systemCalculatedBalance,
		BigDecimal actualClosingBalance,
		BigDecimal difference,
		BigDecimal expectedCash,
		BigDecimal expectedCard,
		BigDecimal expectedTransfer,
		BigDecimal countedCash,
		BigDecimal countedCard,
		BigDecimal countedTransfer,
		BigDecimal cardDifference,
		BigDecimal transferDifference,
		SessionStatus status,
		String notes) {
}
