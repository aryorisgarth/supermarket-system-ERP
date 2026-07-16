package com.supermarket.billing.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentIntentResponseDTO {
    private String clientSecret;
    private String paymentIntentId;
}
