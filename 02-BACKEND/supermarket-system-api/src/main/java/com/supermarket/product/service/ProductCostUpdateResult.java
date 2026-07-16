package com.supermarket.product.service;

import java.math.BigDecimal;

public record ProductCostUpdateResult(
		Long productId,
		String productName,
		BigDecimal previousLastCost,
		BigDecimal newLastCost,
		BigDecimal previousAverageCost,
		BigDecimal newAverageCost,
		BigDecimal quantityBefore,
		BigDecimal quantityReceived,
		BigDecimal quantityAfter,
		BigDecimal salePrice,
		BigDecimal currentMarginPercent,
		BigDecimal minMarginPercent,
		BigDecimal suggestedSalePrice,
		boolean marginAlert
) {
}
