package com.supermarket.billing.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class PaymentIntentRequestDTO {
    @NotNull
    @Positive
    private BigDecimal amount;
    
    private String currency = "GTQ"; // Moneda por defecto
}
