package com.supermarket.billing.dto;

import java.time.LocalDateTime;

import com.supermarket.billing.model.ElectronicInvoiceStatus;

public record ElectronicInvoiceResponseDTO(
		Long id,
		Long saleId,
		String invoiceNumber,
		String countryCode,
		String providerCode,
		ElectronicInvoiceStatus status,
		String authorizationNumber,
		String fiscalUuid,
		String issuerTaxId,
		String receiverTaxId,
		String errorMessage,
		LocalDateTime authorizedAt,
		LocalDateTime createdAt) {
}
