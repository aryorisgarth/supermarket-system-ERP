package com.supermarket.product.dto;

import java.math.BigDecimal;

public record ProductLocationResponseDTO(
	Long id,
	Long productId,
	String productName,
	String productBarcode,
	Long locationId,
	String warehouse,
	String aisle,
	String shelf,
	String level,
	String locationCode,
	Boolean isPisoVenta,
	BigDecimal stock
) {
}
