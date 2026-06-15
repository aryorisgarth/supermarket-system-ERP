package com.supermarket.billing.provider;

import java.math.BigDecimal;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

import org.springframework.stereotype.Component;


@Component
public class VisanetPaymentGatewayProvider implements PaymentGatewayProvider {

	@Override
	public String providerCode() {
		return "VISANET";
	}

	@Override
	public PaymentAuthorizationResult authorize(String providerName, BigDecimal amount, String currency) {
		if (amount == null || amount.signum() <= 0) {
			return new PaymentAuthorizationResult(false, null, null, "Monto inválido");
		}

		
		if (ThreadLocalRandom.current().nextInt(100) < 3) {
			return new PaymentAuthorizationResult(false, null,
					"{\"provider\":\"VISANET\",\"status\":\"declined\",\"responseCode\":\"05\"}",
					"Transacción rechazada por el banco emisor");
		}

		String authCode = String.format("%06d", ThreadLocalRandom.current().nextInt(1_000_000));
		String ref = "VIS-" + authCode + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
		String raw = "{\"provider\":\"VISANET\",\"status\":\"approved\",\"authCode\":\"" + authCode
				+ "\",\"amount\":" + amount.toPlainString() + ",\"currency\":\"" + currency
				+ "\",\"terminalMode\":\"POS\",\"acquirer\":\"BAC/Visanet NI\"}";
		return new PaymentAuthorizationResult(true, ref, raw, null);
	}
}
