package com.supermarket.product.dto;

public record ProductSummaryDTO(
		Long id,
		String barcode,
		String name,
		Boolean requiresBatch,
		Boolean requiresExpiration) {

	public ProductSummaryDTO(Long id, String barcode, String name) {
		this(id, barcode, name, null, null);
	}
}
