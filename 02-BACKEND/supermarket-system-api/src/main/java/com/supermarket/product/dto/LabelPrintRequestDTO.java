package com.supermarket.product.dto;

import java.util.List;

import jakarta.validation.constraints.NotEmpty;

public record LabelPrintRequestDTO(
		@NotEmpty List<Long> productIds
) {
}
