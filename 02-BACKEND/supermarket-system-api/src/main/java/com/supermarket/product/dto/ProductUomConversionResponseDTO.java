package com.supermarket.product.dto;

import java.math.BigDecimal;

public record ProductUomConversionResponseDTO(
		Long id,
		String barcode,
		String label,
		BigDecimal factor,
		BigDecimal salePrice,
		Boolean isPurchaseDefault,
		Boolean isSaleDefault
) {
}
