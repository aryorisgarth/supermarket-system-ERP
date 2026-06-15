package com.supermarket.report.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ReportKpiDTO(
		LocalDate from,
		LocalDate to,
		BigDecimal totalSales,
		long salesCount,
		BigDecimal averageTicket,
		BigDecimal grossProfit,
		BigDecimal grossMarginPercentage,
		BigDecimal inventoryValue,
		long criticalStockProducts) {
}
