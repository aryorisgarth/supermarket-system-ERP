package com.supermarket.purchase.dto;

import java.math.BigDecimal;

import com.supermarket.product.dto.ProductSummaryDTO;

public record PurchaseOrderItemResponseDTO(
		Long id,
		ProductSummaryDTO product,
		String packLabel,
		BigDecimal quantityInPacks,
		BigDecimal costPerPack,
		BigDecimal unitsPerPack,
		BigDecimal quantityOrdered,
		BigDecimal quantityReceived,
		BigDecimal unitCost,
		BigDecimal lineTotal) {
}
