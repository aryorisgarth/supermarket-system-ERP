package com.supermarket.brand.dto;

import java.time.LocalDateTime;

public record BrandResponseDTO(
	Long id,
	String name,
	Boolean isActive,
	LocalDateTime createdAt,
	LocalDateTime updatedAt
) {
}
