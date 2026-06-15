package com.supermarket.billing.provider;

import java.math.BigDecimal;
import java.util.UUID;

import org.springframework.stereotype.Component;


@Component
public class MockPaymentGatewayProvider implements PaymentGatewayProvider {

	@Override
	public String providerCode() {
		return "MOCK";
	}

	@Override
	public PaymentAuthorizationResult authorize(String providerName, BigDecimal amount, String currency) {
		if (amount == null || amount.signum() <= 0) {
			return new PaymentAuthorizationResult(false, null, null, "Monto inválido");
		}
		String ref = "MOCK-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();
		String raw = "{\"provider\":\"" + providerName + "\",\"status\":\"approved\",\"amount\":"
				+ amount.toPlainString() + ",\"currency\":\"" + currency + "\"}";
		return new PaymentAuthorizationResult(true, ref, raw, null);
	}
}
