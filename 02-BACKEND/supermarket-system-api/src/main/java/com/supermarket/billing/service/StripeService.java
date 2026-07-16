package com.supermarket.billing.service;

import java.math.BigDecimal;
import java.util.Locale;
import java.util.Set;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import com.supermarket.billing.dto.PaymentIntentRequestDTO;
import com.supermarket.billing.dto.PaymentIntentResponseDTO;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class StripeService {

	/**
	 * Monedas frecuentes en el POS que Stripe no acepta como presentment (ej. NIO).
	 * En esos casos cobramos en USD de prueba (mismo monto numérico).
	 */
	private static final Set<String> STRIPE_UNSUPPORTED = Set.of("nio");

	@Value("${app.billing.payment-gateway.stripe.secret-key}")
	private String stripeSecretKey;

	@PostConstruct
	public void init() {
		if (isConfiguredForLiveVerification()) {
			Stripe.apiKey = stripeSecretKey;
			log.info("Stripe apiKey initialized (live/test key present).");
		} else {
			log.warn("Stripe secret key missing or dummy — card payments will fail until STRIPE_SECRET_KEY is set.");
		}
	}

	public PaymentIntentResponseDTO createPaymentIntent(PaymentIntentRequestDTO request) throws StripeException {
		if (!isConfiguredForLiveVerification()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
					"Stripe no está configurado. Define STRIPE_SECRET_KEY (sk_test_...) en el entorno.");
		}
		if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El monto del pago debe ser positivo");
		}

		Stripe.apiKey = stripeSecretKey;

		String requested = (request.getCurrency() == null || request.getCurrency().isBlank())
				? "usd"
				: request.getCurrency().trim().toLowerCase(Locale.ROOT);
		String stripeCurrency = STRIPE_UNSUPPORTED.contains(requested) ? "usd" : requested;
		if (!stripeCurrency.equals(requested)) {
			log.info("Stripe presentment: {} no soportada → cobrando en usd (monto numérico igual).", requested);
		}

		long amountCents = request.getAmount().multiply(new BigDecimal("100")).longValue();
		if (amountCents < 50) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
					"Monto demasiado bajo para Stripe (mínimo ~0.50 en la moneda de cobro)");
		}

		PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
				.setAmount(amountCents)
				.setCurrency(stripeCurrency)
				.putMetadata("local_currency", requested)
				.putMetadata("local_amount", request.getAmount().toPlainString())
				.setAutomaticPaymentMethods(
						PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
								.setEnabled(true)
								.build())
				.build();

		PaymentIntent paymentIntent = PaymentIntent.create(params);
		return new PaymentIntentResponseDTO(paymentIntent.getClientSecret(), paymentIntent.getId());
	}

	public PaymentIntent verifySucceededPaymentIntent(String paymentIntentId, BigDecimal expectedAmount)
			throws StripeException {
		if (paymentIntentId == null || paymentIntentId.isBlank()) {
			throw new IllegalArgumentException("PaymentIntent id is required");
		}
		if (!isConfiguredForLiveVerification()) {
			throw new IllegalStateException("Stripe secret key is not configured for live verification");
		}
		Stripe.apiKey = stripeSecretKey;
		PaymentIntent intent = PaymentIntent.retrieve(paymentIntentId.trim());
		if (!"succeeded".equalsIgnoreCase(intent.getStatus())) {
			throw new IllegalStateException("PaymentIntent status is " + intent.getStatus() + ", expected succeeded");
		}
		if (expectedAmount != null) {
			long expectedCents = expectedAmount.multiply(new BigDecimal("100")).longValue();
			if (intent.getAmount() == null || intent.getAmount() != expectedCents) {
				throw new IllegalStateException("PaymentIntent amount mismatch");
			}
		}
		return intent;
	}

	public boolean isConfiguredForLiveVerification() {
		return stripeSecretKey != null
				&& !stripeSecretKey.isBlank()
				&& !stripeSecretKey.contains("dummy")
				&& stripeSecretKey.startsWith("sk_");
	}
}
