package com.supermarket.inventorycount.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.supermarket.inventorycount.model.InventoryCountStatus;
import com.supermarket.user.dto.UserSummaryDTO;

public record InventoryCountSessionResponseDTO(
		Long id,
		String sessionCode,
		InventoryCountStatus status,
		String notes,
		String warehouseZone,
		UserSummaryDTO createdBy,
		UserSummaryDTO approvedBy,
		UserSummaryDTO countedBy,
		LocalDateTime submittedAt,
		LocalDateTime approvedAt,
		LocalDateTime createdAt,
		LocalDateTime updatedAt,
		List<InventoryCountLineResponseDTO> lines) {
}
