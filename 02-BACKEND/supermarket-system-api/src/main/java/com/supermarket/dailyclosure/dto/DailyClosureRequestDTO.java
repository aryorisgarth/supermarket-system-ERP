package com.supermarket.dailyclosure.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record DailyClosureRequestDTO(
		@NotNull LocalDate closureDate,
		BigDecimal totalSales,
		Long salesCount,
		BigDecimal grossProfit,
		BigDecimal grossMarginPercentage,
		BigDecimal totalCashSales,
		BigDecimal totalCardSales,
		BigDecimal totalTransferSales,
		BigDecimal totalCashDifference,
		BigDecimal totalCardDifference,
		BigDecimal totalTransferDifference,
		BigDecimal totalDifference,
		Long openSessionsCount,
		Long closedSessionsCount,
		BigDecimal receivedPurchasesAmount,
		Long pendingPurchasesCount,
		Long partialPurchasesCount,
		Long pendingSettlementsCount,
		BigDecimal pendingSettlementsAmount,
		Long stockAlertsCount,
		String alertsJson,
		@Size(max = 500) String notes) {
}
