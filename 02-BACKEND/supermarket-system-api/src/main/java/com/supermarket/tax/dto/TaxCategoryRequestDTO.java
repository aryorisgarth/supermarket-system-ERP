package com.supermarket.tax.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record TaxCategoryRequestDTO(
		@NotBlank @Size(max = 50) String name,
		@NotNull @DecimalMin(value = "0.0", inclusive = true) BigDecimal percentage,
		Boolean isActive) {
}
