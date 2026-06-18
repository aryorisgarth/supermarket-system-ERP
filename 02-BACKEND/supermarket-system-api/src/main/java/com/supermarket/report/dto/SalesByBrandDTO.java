package com.supermarket.report.dto;

import java.math.BigDecimal;

public record SalesByBrandDTO(
		String brandName,
		Long salesCount,
		BigDecimal totalSales) {
}
