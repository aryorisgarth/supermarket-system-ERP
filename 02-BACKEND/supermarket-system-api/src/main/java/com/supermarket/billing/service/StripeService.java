package com.supermarket.billing.service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

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

    @Value("${app.billing.payment-gateway.stripe.secret-key}")
    private String stripeSecretKey;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeSecretKey;
        log.info("Stripe apiKey initialized.");
    }

    public PaymentIntentResponseDTO createPaymentIntent(PaymentIntentRequestDTO request) throws StripeException {
        // Stripe expects the amount in the smallest currency unit (e.g., cents)
        // If currency is GTQ (Quetzales) or USD, we multiply by 100
        long amount = request.getAmount().multiply(new BigDecimal("100")).longValue();

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amount)
                .setCurrency(request.getCurrency().toLowerCase())
                .setAutomaticPaymentMethods(
                    PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                        .setEnabled(true)
                        .build()
                )
                .build();

        PaymentIntent paymentIntent = PaymentIntent.create(params);

        return new PaymentIntentResponseDTO(paymentIntent.getClientSecret(), paymentIntent.getId());
    }

    /**
     * Verifica en Stripe que el PaymentIntent exista, esté succeeded y coincida el monto.
     */
    public PaymentIntent verifySucceededPaymentIntent(String paymentIntentId, BigDecimal expectedAmount)
            throws StripeException {
        if (paymentIntentId == null || paymentIntentId.isBlank()) {
            throw new IllegalArgumentException("PaymentIntent id is required");
        }
        if (stripeSecretKey == null || stripeSecretKey.isBlank() || stripeSecretKey.contains("dummy")) {
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
        return stripeSecretKey != null && !stripeSecretKey.isBlank() && !stripeSecretKey.contains("dummy");
    }
}
