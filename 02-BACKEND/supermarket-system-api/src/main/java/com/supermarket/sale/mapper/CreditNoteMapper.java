package com.supermarket.sale.mapper;

import java.util.List;

import org.springframework.stereotype.Component;

import com.supermarket.product.dto.ProductSummaryDTO;
import com.supermarket.sale.dto.CreditNoteLineResponseDTO;
import com.supermarket.sale.dto.CreditNoteResponseDTO;
import com.supermarket.sale.entity.CreditNote;
import com.supermarket.sale.entity.CreditNoteLine;
import com.supermarket.user.dto.UserSummaryDTO;

@Component
public class CreditNoteMapper {

	public CreditNoteResponseDTO toResponse(CreditNote entity) {
		var u = entity.getUser();
		var issuedBy = new UserSummaryDTO(u.getId(), u.getFullName(), u.getEmail());
		List<CreditNoteLineResponseDTO> lines = entity.getLines().stream().map(this::toLine).toList();
		return new CreditNoteResponseDTO(
				entity.getId(),
				entity.getCreditNoteNumber(),
				entity.getType(),
				entity.getSale().getId(),
				entity.getSale().getInvoiceNumber(),
				entity.getAmount(),
				entity.getSubtotal(),
				entity.getTotalTax(),
				entity.getReason(),
				entity.getCreatedAt(),
				issuedBy,
				lines);
	}

	private CreditNoteLineResponseDTO toLine(CreditNoteLine l) {
		var p = l.getProduct();
		var productDto = new ProductSummaryDTO(p.getId(), p.getBarcode(), p.getName());
		String batchCode = l.getBatch() != null ? l.getBatch().getBatchCode() : null;
		return new CreditNoteLineResponseDTO(
				l.getId(),
				productDto,
				batchCode,
				l.getQuantity(),
				l.getUnitPrice(),
				l.getTaxApplied(),
				l.getRefundAmount());
	}
}
