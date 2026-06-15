package com.supermarket.sale.dto;

import java.math.BigDecimal;

import com.supermarket.product.dto.ProductSummaryDTO;

public record SaleLineResponseDTO(
		Long id,
		ProductSummaryDTO product,
		Long batchId,
		String batchCode,
		BigDecimal quantity,
		BigDecimal unitPrice,
		BigDecimal taxApplied,
		BigDecimal discountAmount,
		BigDecimal subtotal,
		Long uomConversionId,
		String uomLabel) {
}
