package com.supermarket.customer.dto;

import java.time.LocalDateTime;

public record CustomerResponseDTO(
	Long id,
	String fullName,
	String documentId,
	String phone,
	String email,
	String address,
	Integer points,
	LocalDateTime createdAt,
	LocalDateTime lastPurchaseDate
) {
}
