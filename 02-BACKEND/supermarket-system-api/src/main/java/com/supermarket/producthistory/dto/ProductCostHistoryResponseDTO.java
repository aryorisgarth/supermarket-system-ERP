package com.supermarket.producthistory.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.supermarket.producthistory.model.ProductCostHistoryReason;
import com.supermarket.producthistory.model.ProductCostMethod;

public record ProductCostHistoryResponseDTO(
		Long id,
		Long productId,
		String productName,
		Integer supplierId,
		String supplierName,
		Long purchaseOrderId,
		Long purchaseOrderItemId,
		BigDecimal previousLastCost,
		BigDecimal newLastCost,
		BigDecimal previousAverageCost,
		BigDecimal newAverageCost,
		BigDecimal quantityBefore,
		BigDecimal quantityReceived,
		BigDecimal quantityAfter,
		ProductCostMethod costMethod,
		ProductCostHistoryReason reason,
		Long userId,
		String userName,
		LocalDateTime createdAt
) {
}
