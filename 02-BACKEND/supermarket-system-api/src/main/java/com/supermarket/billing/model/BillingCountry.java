package com.supermarket.billing.model;

public enum BillingCountry {
	GT,
	CO,
	MX,
	
	NI;

	public static BillingCountry fromCode(String code) {
		if (code == null || code.isBlank()) {
			return GT;
		}
		return BillingCountry.valueOf(code.trim().toUpperCase());
	}
}
