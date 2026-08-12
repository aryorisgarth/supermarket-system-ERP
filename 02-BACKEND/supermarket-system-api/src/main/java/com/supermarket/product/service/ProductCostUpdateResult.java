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
		BigDecimal currentMarkupPercent,
		BigDecimal currentMarginPercent,
		/** Markup mínimo (columna BD min_margin_percent). */
		BigDecimal minMarkupPercent,
		BigDecimal suggestedSalePrice,
		/** Alerta si markup actual < markup mínimo. */
		boolean markupAlert
) {
}
