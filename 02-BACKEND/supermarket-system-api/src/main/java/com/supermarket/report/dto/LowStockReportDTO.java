package com.supermarket.report.dto;

import java.math.BigDecimal;

public record LowStockReportDTO(
		String barcode,
		String productName,
		BigDecimal currentStock,
		BigDecimal minimumStock,
		String categoryName) {
}
