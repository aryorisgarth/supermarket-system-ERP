package com.supermarket.category.dto;

public record CategoryResponseDTO(
	Short id,
	String name,
	String description,
	Boolean defaultRequiresBatch,
	Boolean defaultRequiresExpiration
) {
}
