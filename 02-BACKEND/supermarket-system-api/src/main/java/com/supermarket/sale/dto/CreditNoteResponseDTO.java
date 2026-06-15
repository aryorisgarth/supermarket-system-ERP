package com.supermarket.sale.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.supermarket.sale.model.CreditNoteType;
import com.supermarket.user.dto.UserSummaryDTO;

public record CreditNoteResponseDTO(
		Long id,
		String creditNoteNumber,
		CreditNoteType type,
		Long saleId,
		String invoiceNumber,
		BigDecimal amount,
		BigDecimal subtotal,
		BigDecimal totalTax,
		String reason,
		LocalDateTime createdAt,
		UserSummaryDTO issuedBy,
		List<CreditNoteLineResponseDTO> lines) {
}
