package com.supermarket.productbatch.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.supermarket.product.dto.ProductSummaryDTO;

public record ProductBatchResponseDTO(
		Long id,
		ProductSummaryDTO product,
		String batchCode,
		BigDecimal initialQuantity,
		BigDecimal currentQuantity,
		LocalDate entryDate,
		LocalDate expirationDate,
		LocalDateTime createdAt,
		Long purchaseOrderItemId,
		String warehouseZone,
		String qcNotes) {
}
