package com.supermarket.billing.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PaymentAccountResponseDTO(
		Long id,
		String name,
		String bankName,
		String accountHolder,
		String accountNumberMasked,
		String accountType,
		String currency,
		String taxId,
		String gatewayProvider,
		String merchantId,
		String terminalId,
		BigDecimal commissionPercentage,
		Integer settlementDays,
		Boolean isDefault,
		Boolean isActive,
		LocalDateTime createdAt,
		LocalDateTime updatedAt) {
}
