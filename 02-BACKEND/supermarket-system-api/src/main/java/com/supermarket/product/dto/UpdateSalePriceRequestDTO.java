package com.supermarket.product.dto;

import java.math.BigDecimal;

import com.supermarket.producthistory.model.ProductSalePriceHistoryReason;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateSalePriceRequestDTO(
		@NotNull
		@DecimalMin(value = "0.0", inclusive = false)
		BigDecimal newSalePrice,
		ProductSalePriceHistoryReason reason,
		@Size(max = 255)
		String notes
) {
}
