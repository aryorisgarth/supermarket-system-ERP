package com.supermarket.cashregister.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public record CashRegisterCloseDTO(
		@NotNull @DecimalMin(value = "0.0", inclusive = true) BigDecimal actualClosingBalance,
		@DecimalMin(value = "0.0", inclusive = true) BigDecimal countedCard,
		@DecimalMin(value = "0.0", inclusive = true) BigDecimal countedTransfer,
		String notes) {
}
