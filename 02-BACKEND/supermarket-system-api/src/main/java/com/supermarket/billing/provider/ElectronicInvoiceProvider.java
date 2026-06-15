package com.supermarket.billing.provider;

import com.supermarket.billing.model.BillingCountry;
import com.supermarket.sale.entity.Sale;

public interface ElectronicInvoiceProvider {

	boolean supports(BillingCountry country);

	ElectronicInvoiceResult authorize(Sale sale, String issuerTaxId, String receiverTaxId);

	record ElectronicInvoiceResult(
			boolean success,
			String authorizationNumber,
			String fiscalUuid,
			String errorMessage) {
	}
}
