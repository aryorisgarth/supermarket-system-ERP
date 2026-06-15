package com.supermarket.billing.provider;

import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;


@Component
public class StripePaymentGatewayProvider implements PaymentGatewayProvider {

	@Value("${app.billing.payment-gateway.stripe.secret-key:sk_test_51P1dummykey}")
	private String secretKey;

	@Override
	public String providerCode() {
		return "STRIPE";
	}

	@Override
	public PaymentAuthorizationResult authorize(String providerName, BigDecimal amount, String currency) {
		if (amount == null || amount.signum() <= 0) {
			return new PaymentAuthorizationResult(false, null, null, "Monto inválido");
		}

		
		long amountInCents = amount.multiply(BigDecimal.valueOf(100)).longValue();
		String lowercaseCurrency = currency.toLowerCase();

		try {
			HttpClient client = HttpClient.newHttpClient();

			
			String requestBody = "amount=" + amountInCents
					+ "&currency=" + lowercaseCurrency
					+ "&payment_method=pm_card_visa"
					+ "&confirm=true"
					+ "&automatic_payment_methods[enabled]=true"
					+ "&automatic_payment_methods[allow_redirects]=never";

			HttpRequest request = HttpRequest.newBuilder()
					.uri(URI.create("https://api.stripe.com/v1/payment_intents"))
					.header("Authorization", "Bearer " + secretKey)
					.header("Content-Type", "application/x-www-form-urlencoded")
					.POST(HttpRequest.BodyPublishers.ofString(requestBody))
					.build();

			HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
			String responseBody = response.body();

			if (response.statusCode() >= 200 && response.statusCode() < 300) {
				
				String idPattern = "\"id\": \"";
				int idIdx = responseBody.indexOf(idPattern);
				String stripeId = "STRIPE-" + UUID.randomUUID().toString().substring(0, 8);
				if (idIdx != -1) {
					int endIdx = responseBody.indexOf("\"", idIdx + idPattern.length());
					if (endIdx != -1) {
						stripeId = responseBody.substring(idIdx + idPattern.length(), endIdx);
					}
				}
				return new PaymentAuthorizationResult(true, stripeId, responseBody, null);
			} else {
				
				String errPattern = "\"message\": \"";
				int errIdx = responseBody.indexOf(errPattern);
				String errorMsg = "Error en pasarela Stripe (Status " + response.statusCode() + ")";
				if (errIdx != -1) {
					int endIdx = responseBody.indexOf("\"", errIdx + errPattern.length());
					if (endIdx != -1) {
						errorMsg = responseBody.substring(errIdx + errPattern.length(), endIdx);
					}
				}
				return new PaymentAuthorizationResult(false, null, responseBody, errorMsg);
			}
		} catch (Exception e) {
			return new PaymentAuthorizationResult(false, null, null, "Error al conectar con Stripe: " + e.getMessage());
		}
	}
}
