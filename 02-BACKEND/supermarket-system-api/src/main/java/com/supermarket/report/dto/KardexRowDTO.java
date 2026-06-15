package com.supermarket.report.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.supermarket.inventory.model.InventoryMovementType;

public record KardexRowDTO(
		LocalDateTime createdAt,
		Long productId,
		String productBarcode,
		String productName,
		Long batchId,
		String batchCode,
		InventoryMovementType movementType,
		BigDecimal quantity,
		Byte factor,
		BigDecimal entryQuantity,
		BigDecimal exitQuantity,
		BigDecimal previousStock,
		BigDecimal newStock,
		BigDecimal unitCost,
		BigDecimal totalCost,
		Long userId,
		String userFullName,
		Long referenceId,
		Long referenceLineId,
		String sourceType,
		String notes) {
}
