package com.supermarket.cashregister.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public record CashRegisterOpenDTO(
		@NotNull @DecimalMin(value = "0.0", inclusive = true) BigDecimal openingBalance,
		@NotNull Long cashRegisterId) {
}
