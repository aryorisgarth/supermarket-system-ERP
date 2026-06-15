package com.supermarket.inventorycount.dto;

import java.math.BigDecimal;

public record InventoryCountLineResponseDTO(
		Long id,
		Long productId,
		String barcode,
		String productName,
		BigDecimal systemQuantity,
		BigDecimal countedQuantity,
		BigDecimal variance,
		String notes,
		Long uomConversionId,
		String uomLabel,
		BigDecimal uomFactor,
		BigDecimal countedQuantityCommercial,
		Long batchId,
		String batchCode) {
}
