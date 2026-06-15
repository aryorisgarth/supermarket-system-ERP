package com.supermarket.dailyclosure.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.supermarket.user.dto.UserSummaryDTO;

public record DailyClosureResponseDTO(
		Long id,
		LocalDate closureDate,
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
		String notes,
		UserSummaryDTO closedBy,
		LocalDateTime closedAt) {
}
