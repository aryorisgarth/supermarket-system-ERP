package com.supermarket.report.dto;

import java.math.BigDecimal;

public record PurchasesByBrandDTO(
		String brandName,
		Long purchasesCount,
		BigDecimal totalPurchases) {
}
