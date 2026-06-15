package com.supermarket.billing.provider;

import java.math.BigDecimal;

public interface PaymentGatewayProvider {

	String providerCode();

	PaymentAuthorizationResult authorize(String providerName, BigDecimal amount, String currency);

	record PaymentAuthorizationResult(
			boolean approved,
			String externalReference,
			String rawResponse,
			String errorMessage) {
	}
}
