package com.supermarket.cashregister.dto;

import java.math.BigDecimal;
import java.util.List;

public record CashRegisterSummaryDTO(
		CashRegisterSessionDTO session,
		BigDecimal cashSales,
		BigDecimal cardSales,
		BigDecimal transferSales,
		BigDecimal couponSales,
		BigDecimal pointsSales,
		BigDecimal changeAmount,
		BigDecimal refunds,
		BigDecimal manualCashIn,
		BigDecimal manualCashOut,
		BigDecimal expectedCash,
		BigDecimal expectedCard,
		BigDecimal expectedTransfer,
		List<CashRegisterMovementDTO> movements) {
}
