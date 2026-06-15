package com.supermarket.billing.provider;

import java.util.UUID;

import org.springframework.stereotype.Component;

import com.supermarket.billing.model.BillingCountry;
import com.supermarket.sale.entity.Sale;


@Component
public class GuatemalaFelProvider implements ElectronicInvoiceProvider {

	@Override
	public boolean supports(BillingCountry country) {
		return country == BillingCountry.GT;
	}

	@Override
	public ElectronicInvoiceResult authorize(Sale sale, String issuerTaxId, String receiverTaxId) {
		String authNumber = "SAT-GT-" + sale.getInvoiceNumber();
		String uuid = UUID.randomUUID().toString().toUpperCase();
		return new ElectronicInvoiceResult(true, authNumber, uuid, null);
	}
}
