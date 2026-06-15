package com.supermarket.sale.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record SaleRequestDTO(
		Long customerId,
		
		@Size(max = 50) String invoiceNumber,
		@NotEmpty @Valid List<SalePaymentRequestDTO> payments,
		@NotEmpty @Valid List<SaleLineRequestDTO> lines) {
}
