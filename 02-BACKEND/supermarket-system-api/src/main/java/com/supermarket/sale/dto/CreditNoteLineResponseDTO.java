package com.supermarket.sale.dto;

import java.math.BigDecimal;

import com.supermarket.product.dto.ProductSummaryDTO;

public record CreditNoteLineResponseDTO(
		Long id,
		ProductSummaryDTO product,
		String batchCode,
		BigDecimal quantity,
		BigDecimal unitPrice,
		BigDecimal taxApplied,
		BigDecimal refundAmount) {
}
