package com.supermarket.billing.provider;

import java.util.UUID;

import org.springframework.stereotype.Component;

import com.supermarket.billing.model.BillingCountry;
import com.supermarket.sale.entity.Sale;


@Component
public class ColombiaDianProvider implements ElectronicInvoiceProvider {

	@Override
	public boolean supports(BillingCountry country) {
		return country == BillingCountry.CO;
	}

	@Override
	public ElectronicInvoiceResult authorize(Sale sale, String issuerTaxId, String receiverTaxId) {
		String cufe = UUID.randomUUID().toString().replace("-", "").toUpperCase();
		String authNumber = "DIAN-CO-" + sale.getInvoiceNumber();
		return new ElectronicInvoiceResult(true, authNumber, cufe, null);
	}
}
