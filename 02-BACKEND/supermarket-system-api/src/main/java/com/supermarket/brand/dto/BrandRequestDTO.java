package com.supermarket.brand.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record BrandRequestDTO(
	@NotBlank @Size(max = 100) String name,
	Boolean isActive
) {
}
