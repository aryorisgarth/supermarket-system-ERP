package com.supermarket.report.dto;

import java.math.BigDecimal;

public record InventoryTurnoverDTO(
		Long productId,
		String productBarcode,
		String productName,
		BigDecimal quantitySold,
		BigDecimal currentStock,
		BigDecimal averageDailySold,
		BigDecimal turnoverRatio,
		BigDecimal daysOfInventory,
		boolean lowRotation) {
}
