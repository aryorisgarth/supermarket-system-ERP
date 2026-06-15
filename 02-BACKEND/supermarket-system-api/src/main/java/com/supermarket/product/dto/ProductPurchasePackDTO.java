package com.supermarket.product.dto;

import java.math.BigDecimal;

public record ProductPurchasePackDTO(
		Long id,
		String label,
		BigDecimal factor,
		Boolean isDefault,
		Integer sortOrder) {
}
