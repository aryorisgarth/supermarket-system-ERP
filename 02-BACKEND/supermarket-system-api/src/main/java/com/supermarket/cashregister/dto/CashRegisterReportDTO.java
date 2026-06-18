package com.supermarket.cashregister.dto;

import java.math.BigDecimal;

public record CashRegisterReportDTO(
		long openSessionsCount,
		long closedSessionsCount,
		long sessionsWithDifference,
		BigDecimal totalCashDifference,
		BigDecimal totalCardDifference,
		BigDecimal totalTransferDifference,
		BigDecimal totalCashSales,
		BigDecimal totalCardSales,
		BigDecimal totalTransferSales,
		BigDecimal totalCouponSales,
		BigDecimal totalPointsSales,
		BigDecimal totalSalesVolume) {
}
