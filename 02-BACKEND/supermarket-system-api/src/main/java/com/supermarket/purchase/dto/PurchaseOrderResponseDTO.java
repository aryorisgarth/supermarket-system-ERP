package com.supermarket.purchase.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.supermarket.purchase.model.PurchaseOrderStatus;
import com.supermarket.user.dto.UserSummaryDTO;

public record PurchaseOrderResponseDTO(
		Long id,
		String orderNumber,
		PurchaseOrderStatus status,
		Integer supplierId,
		String supplierName,
		BigDecimal subtotal,
		String notes,
		UserSummaryDTO createdBy,
		UserSummaryDTO receivedBy,
		LocalDateTime orderedAt,
		LocalDateTime receivedAt,
		LocalDateTime createdAt,
		LocalDateTime updatedAt,
		List<PurchaseOrderItemResponseDTO> items) {
}
