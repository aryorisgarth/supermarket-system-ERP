package com.supermarket.billing.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.stripe.exception.StripeException;
import com.supermarket.billing.dto.PaymentIntentRequestDTO;
import com.supermarket.billing.dto.PaymentIntentResponseDTO;
import com.supermarket.billing.service.StripeService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Tag(name = "Pagos", description = "Integración con pasarelas de pago")
@SecurityRequirement(name = "bearerAuth")
@Slf4j
public class PaymentController {

    private final StripeService stripeService;

    @PostMapping("/create-intent")
    @Operation(summary = "Crear Intención de Pago", description = "Genera un client_secret de Stripe para procesar un pago con tarjeta")
    public ResponseEntity<PaymentIntentResponseDTO> createPaymentIntent(@Valid @RequestBody PaymentIntentRequestDTO request) {
        try {
            PaymentIntentResponseDTO response = stripeService.createPaymentIntent(request);
            return ResponseEntity.ok(response);
        } catch (StripeException e) {
            log.error("Error al crear PaymentIntent con Stripe", e);
            throw new RuntimeException("Error al procesar el pago con la pasarela: " + e.getMessage());
        }
    }
}
