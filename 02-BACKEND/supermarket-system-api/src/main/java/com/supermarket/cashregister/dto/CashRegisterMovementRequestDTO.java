package com.supermarket.cashregister.dto;

import java.math.BigDecimal;

import com.supermarket.cashregister.model.CashMovementType;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CashRegisterMovementRequestDTO(
		@NotNull CashMovementType type,
		@NotNull @DecimalMin(value = "0.0", inclusive = false) BigDecimal amount,
		@NotBlank @Size(max = 255) String reason) {
}
