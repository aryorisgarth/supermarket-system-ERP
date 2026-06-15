package com.supermarket.report.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record InventoryMovementReportDTO(
		LocalDateTime createdAt,
		String productName,
		String movementType,
		BigDecimal quantity,
		BigDecimal previousStock,
		BigDecimal newStock,
		String userFullName,
		BigDecimal unitCost,
		BigDecimal totalCost) {
}
