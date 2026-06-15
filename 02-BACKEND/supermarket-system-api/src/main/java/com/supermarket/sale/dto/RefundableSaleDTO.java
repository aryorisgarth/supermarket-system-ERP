package com.supermarket.sale.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.supermarket.customer.dto.CustomerSummaryDTO;
import com.supermarket.sale.model.SaleStatus;

public record RefundableSaleDTO(
		Long saleId,
		String invoiceNumber,
		SaleStatus status,
		LocalDateTime saleDate,
		CustomerSummaryDTO customer,
		BigDecimal totalAmount,
		BigDecimal alreadyRefunded,
		BigDecimal refundableTotal,
		boolean fullyRefunded,
		List<RefundableLineDTO> lines) {
}
