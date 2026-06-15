package com.supermarket.report.dto;

import java.math.BigDecimal;

public record ProductPerformanceDTO(
		Long productId,
		String productBarcode,
		String productName,
		BigDecimal quantitySold,
		BigDecimal revenue,
		BigDecimal cost,
		BigDecimal grossProfit,
		BigDecimal grossMarginPercentage) {
}
