package com.supermarket.sale.dto;

import java.math.BigDecimal;

import com.supermarket.product.dto.ProductSummaryDTO;

public record RefundableLineDTO(
		Long saleDetailId,
		ProductSummaryDTO product,
		Long batchId,
		String batchCode,
		BigDecimal quantity,
		BigDecimal returnedQuantity,
		BigDecimal returnableQuantity,
		BigDecimal unitPrice,
		BigDecimal taxApplied,
		BigDecimal discountAmount,
		BigDecimal unitRefund) {
}
