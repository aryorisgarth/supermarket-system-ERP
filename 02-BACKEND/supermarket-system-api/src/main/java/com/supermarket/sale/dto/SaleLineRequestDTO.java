package com.supermarket.sale.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public record SaleLineRequestDTO(
		@NotNull Long productId,
		Long batchId,
		@NotNull @DecimalMin(value = "0.0", inclusive = false) BigDecimal quantity,
		BigDecimal unitPrice,
		BigDecimal taxApplied,
		BigDecimal discountAmount,
		Long uomConversionId) {
}
