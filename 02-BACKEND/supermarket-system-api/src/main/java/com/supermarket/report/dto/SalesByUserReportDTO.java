package com.supermarket.report.dto;

import java.math.BigDecimal;

public record SalesByUserReportDTO(
		String userFullName,
		long salesCount,
		BigDecimal totalSales) {
}
