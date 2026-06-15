package com.supermarket.sale.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.supermarket.customer.dto.CustomerSummaryDTO;
import com.supermarket.sale.model.PaymentMethod;
import com.supermarket.sale.model.SaleStatus;
import com.supermarket.user.dto.UserSummaryDTO;

public record SaleSummaryResponseDTO(
		Long id,
		Long sessionId,
		String invoiceNumber,
		SaleStatus status,
		BigDecimal totalAmount,
		LocalDateTime saleDate,
		CustomerSummaryDTO customer,
		UserSummaryDTO seller) {
}
