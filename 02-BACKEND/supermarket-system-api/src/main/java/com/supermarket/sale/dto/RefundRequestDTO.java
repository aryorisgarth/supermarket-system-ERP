package com.supermarket.sale.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;


public record RefundRequestDTO(
		@NotBlank @Size(max = 255) String reason,
		@Valid List<RefundLineRequestDTO> lines) {
}
