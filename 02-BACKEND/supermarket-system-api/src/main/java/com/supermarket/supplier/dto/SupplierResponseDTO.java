package com.supermarket.supplier.dto;

import java.time.LocalDateTime;

public record SupplierResponseDTO(
	Integer id,
	String companyName,
	String contactName,
	String phone,
	String email,
	String address,
	LocalDateTime createdAt
) {
}
