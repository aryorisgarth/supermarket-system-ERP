package com.supermarket.report.dto;

import java.math.BigDecimal;

import com.supermarket.sale.model.PaymentMethod;

public record PaymentMethodReportDTO(
		PaymentMethod paymentMethod,
		long paymentCount,
		BigDecimal totalAmount,
		BigDecimal percentageOfTotal) {
}
