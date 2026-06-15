package com.supermarket.inventory.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.supermarket.inventory.model.InventoryMovementType;
import com.supermarket.product.dto.ProductSummaryDTO;
import com.supermarket.user.dto.UserSummaryDTO;

public record InventoryMovementResponseDTO(
		Long id,
		ProductSummaryDTO product,
		Long batchId,
		String batchCode,
		UserSummaryDTO user,
		InventoryMovementType movementType,
		BigDecimal quantity,
		Byte factor,
		Long referenceId,
		BigDecimal previousStock,
		BigDecimal newStock,
		BigDecimal unitCost,
		BigDecimal totalCost,
		String sourceType,
		Long referenceLineId,
		String notes,
		LocalDateTime createdAt) {
}
