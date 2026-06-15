package com.supermarket.report.dto;

import java.math.BigDecimal;

public record ReportKpiComparisonDTO(
		ReportKpiDTO current,
		ReportKpiDTO previous,
		BigDecimal totalSalesChange,
		BigDecimal totalSalesChangePercentage,
		long salesCountChange,
		BigDecimal salesCountChangePercentage,
		BigDecimal averageTicketChange,
		BigDecimal averageTicketChangePercentage,
		BigDecimal grossProfitChange,
		BigDecimal grossProfitChangePercentage,
		BigDecimal grossMarginPercentagePointChange) {
}
