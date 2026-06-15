package com.supermarket.sale.dto;

import java.math.BigDecimal;

import com.supermarket.sale.model.PaymentMethod;

public record SalePaymentResponseDTO(
		Long id,
		PaymentMethod method,
		BigDecimal amount) {
}
