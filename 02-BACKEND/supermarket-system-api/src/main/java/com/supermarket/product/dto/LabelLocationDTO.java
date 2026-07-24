package com.supermarket.product.dto;

public record LabelLocationDTO(
		String locationCode,
		String aisle,
		String shelf,
		String level,
		String warehouse,
		Boolean isPisoVenta
) {
}
