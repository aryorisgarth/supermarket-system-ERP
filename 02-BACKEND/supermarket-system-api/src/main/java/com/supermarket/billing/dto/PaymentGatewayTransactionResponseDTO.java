package com.supermarket.billing.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.supermarket.billing.model.PaymentGatewayStatus;

public record PaymentGatewayTransactionResponseDTO(
		Long id,
		Long saleId,
		String providerCode,
		String externalReference,
		Long paymentAccountId,
		String paymentAccountName,
		String paymentAccountMasked,
		BigDecimal amount,
		BigDecimal commissionAmount,
		BigDecimal netAmount,
		String currency,
		PaymentGatewayStatus status,
		String paymentMethod,
		String settlementStatus,
		java.time.LocalDate expectedSettlementDate,
		LocalDateTime createdAt) {
}
