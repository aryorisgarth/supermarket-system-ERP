package com.supermarket.sale.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public record RefundLineRequestDTO(
		@NotNull Long saleDetailId,
		@NotNull @DecimalMin(value = "0.0", inclusive = false) BigDecimal quantity) {
}
