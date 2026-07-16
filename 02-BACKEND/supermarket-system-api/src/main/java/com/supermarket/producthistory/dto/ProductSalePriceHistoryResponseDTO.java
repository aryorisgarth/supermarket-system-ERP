package com.supermarket.producthistory.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.supermarket.producthistory.model.ProductCostReference;
import com.supermarket.producthistory.model.ProductSalePriceHistoryReason;

public record ProductSalePriceHistoryResponseDTO(
		Long id,
		Long productId,
		String productName,
		BigDecimal previousSalePrice,
		BigDecimal newSalePrice,
		ProductCostReference costReference,
		BigDecimal marginBeforePercent,
		BigDecimal marginAfterPercent,
		ProductSalePriceHistoryReason reason,
		String notes,
		Long userId,
		String userName,
		LocalDateTime createdAt
) {
}
