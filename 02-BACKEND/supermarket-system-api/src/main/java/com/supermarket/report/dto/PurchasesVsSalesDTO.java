package com.supermarket.report.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PurchasesVsSalesDTO(
		LocalDate from,
		LocalDate to,
		BigDecimal totalSales,
		BigDecimal totalPurchases,
		BigDecimal netDifference,
		BigDecimal purchasesToSalesPercentage) {
}
