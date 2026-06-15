package com.supermarket.sale.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.supermarket.customer.dto.CustomerSummaryDTO;
import com.supermarket.sale.model.PaymentMethod;
import com.supermarket.sale.model.SaleStatus;
import com.supermarket.user.dto.UserSummaryDTO;

public record SaleResponseDTO(
		Long id,
		Long sessionId,
		String invoiceNumber,
		SaleStatus status,
		BigDecimal subtotal,
		BigDecimal totalTax,
		BigDecimal totalAmount,
		LocalDateTime saleDate,
		CustomerSummaryDTO customer,
		UserSummaryDTO seller,
		BigDecimal changeAmount,
		List<SalePaymentResponseDTO> payments,
		List<SaleLineResponseDTO> lines,
		Integer pointsEarned,
		Integer pointsRedeemed,
		Integer customerPoints) {
}
