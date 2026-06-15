package com.supermarket.billing.service;

import org.springframework.stereotype.Service;

import com.supermarket.billing.config.BillingProperties;
import com.supermarket.billing.dto.BillingConfigResponseDTO;
import com.supermarket.billing.model.BillingCountry;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BillingConfigService {

	private final BillingProperties billingProperties;

	public BillingConfigResponseDTO getConfig() {
		BillingCountry country = BillingCountry.fromCode(billingProperties.country());
		return new BillingConfigResponseDTO(
				country.name(),
				countryLabel(country),
				billingProperties.electronicInvoice().enabled(),
				billingProperties.paymentGateway().enabled(),
				billingProperties.paymentGateway().provider(),
				billingProperties.paymentGateway().currency(),
				billingProperties.electronicInvoice().issuerTaxId(),
				regulatoryAuthority(country));
	}

	private static String countryLabel(BillingCountry country) {
		return switch (country) {
			case GT -> "Guatemala";
			case CO -> "Colombia";
			case MX -> "México";
			case NI -> "Nicaragua";
		};
	}

	private static String regulatoryAuthority(BillingCountry country) {
		return switch (country) {
			case GT -> "SAT — Factura Electrónica en Línea (FEL)";
			case CO -> "DIAN — Facturación Electrónica";
			case MX -> "SAT México — CFDI";
			case NI -> "DGI — Facturación Electrónica (simulada)";
		};
	}
}
