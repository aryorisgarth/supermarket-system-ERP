package com.supermarket.product.dto;

import java.math.BigDecimal;
import java.util.List;

public record LabelProductDTO(
		Long productId,
		String name,
		String barcode,
		BigDecimal salePrice,
		String uomBase,
		String categoryName,
		String brandName,
		BigDecimal minStockExhibicion,
		List<LabelLocationDTO> locations
) {
}
