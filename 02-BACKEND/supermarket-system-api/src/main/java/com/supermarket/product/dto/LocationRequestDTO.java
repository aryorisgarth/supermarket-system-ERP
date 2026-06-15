package com.supermarket.product.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LocationRequestDTO(
	@NotBlank @Size(max = 100) String warehouse,
	@Size(max = 50) String aisle,
	@Size(max = 50) String shelf,
	@Size(max = 50) String level,
	@NotBlank @Size(max = 100) String locationCode,
	Boolean isPisoVenta
) {
}
