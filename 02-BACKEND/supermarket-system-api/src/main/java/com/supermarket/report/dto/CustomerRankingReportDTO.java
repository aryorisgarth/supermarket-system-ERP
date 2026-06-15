package com.supermarket.report.dto;

import java.math.BigDecimal;

public record CustomerRankingReportDTO(
		String customerFullName,
		String identifier,
		long visits,
		BigDecimal totalSpent) {
}
