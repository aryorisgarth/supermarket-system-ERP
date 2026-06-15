package com.supermarket.product.dto;

import java.time.LocalDateTime;

public record LocationResponseDTO(
	Long id,
	String warehouse,
	String aisle,
	String shelf,
	String level,
	String locationCode,
	Boolean isPisoVenta,
	LocalDateTime createdAt,
	LocalDateTime updatedAt
) {
}
