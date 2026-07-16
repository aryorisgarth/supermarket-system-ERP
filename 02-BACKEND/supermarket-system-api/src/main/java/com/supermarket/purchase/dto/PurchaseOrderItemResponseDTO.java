package com.supermarket.purchase.dto;

import java.math.BigDecimal;

import com.supermarket.product.dto.ProductSummaryDTO;

public record PurchaseOrderItemResponseDTO(
		Long id,
		ProductSummaryDTO product,
		String packLabel,
		BigDecimal quantityInPacks,
		BigDecimal costPerPack,
		BigDecimal salePricePerPack,
		BigDecimal salePricePerUnit,
		BigDecimal unitsPerPack,
		BigDecimal quantityOrdered,
		BigDecimal quantityReceived,
		BigDecimal quantityRejected,
		BigDecimal unitCost,
		BigDecimal lineTotal) {
}
