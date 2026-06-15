package com.supermarket.tax.dto;

import java.math.BigDecimal;

public record TaxCategoryResponseDTO(
		Integer id,
		String name,
		BigDecimal percentage,
		Boolean isActive) {
}
