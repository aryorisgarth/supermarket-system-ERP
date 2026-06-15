package com.supermarket.sale.dto;

import java.math.BigDecimal;

import com.supermarket.sale.model.PaymentMethod;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public record SalePaymentRequestDTO(
		@NotNull PaymentMethod method,
		@NotNull @DecimalMin(value = "0.0", inclusive = false) BigDecimal amount,
		String couponCode) {
}
