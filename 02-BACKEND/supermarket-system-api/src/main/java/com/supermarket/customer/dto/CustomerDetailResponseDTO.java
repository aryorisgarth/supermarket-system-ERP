package com.supermarket.customer.dto;

import java.time.LocalDateTime;
import java.util.List;
import com.supermarket.sale.dto.SaleSummaryResponseDTO;

public record CustomerDetailResponseDTO(
	Long id,
	String fullName,
	String documentId,
	String phone,
	String email,
	String address,
	Integer points,
	LocalDateTime createdAt,
	List<SaleSummaryResponseDTO> sales
) {
}
