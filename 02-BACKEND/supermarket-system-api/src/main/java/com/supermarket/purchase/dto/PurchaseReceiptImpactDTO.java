package com.supermarket.purchase.dto;

import java.math.BigDecimal;

public record PurchaseReceiptImpactDTO(
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
