package com.supermarket.billing.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.billing")
public record BillingProperties(
		String country,
		ElectronicInvoice electronicInvoice,
		PaymentGateway paymentGateway) {

	public record ElectronicInvoice(boolean enabled, String issuerTaxId) {
	}

	public record PaymentGateway(boolean enabled, String provider, String currency) {
	}
}
