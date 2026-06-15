package com.supermarket.billing.dto;

public record BillingConfigResponseDTO(
		String country,
		String countryLabel,
		boolean electronicInvoiceEnabled,
		boolean paymentGatewayEnabled,
		String paymentGatewayProvider,
		String currency,
		String issuerTaxId,
		String regulatoryAuthority) {
}
