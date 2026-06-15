package com.supermarket.billing.provider;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.format.DateTimeFormatter;

import org.springframework.stereotype.Component;

import com.supermarket.billing.model.BillingCountry;
import com.supermarket.sale.entity.Sale;

import lombok.extern.slf4j.Slf4j;


@Slf4j
@Component
public class NicaraguaDgiProvider implements ElectronicInvoiceProvider {

	@Override
	public boolean supports(BillingCountry country) {
		return country == BillingCountry.NI;
	}

	@Override
	public ElectronicInvoiceResult authorize(Sale sale, String issuerTaxId, String receiverTaxId) {
		try {
			int year = sale.getSaleDate() != null ? sale.getSaleDate().getYear() : java.time.LocalDateTime.now().getYear();
			String authNumber = String.format("NI-DGI-%d-%s", year, sale.getInvoiceNumber());

			
			String raw = issuerTaxId + "|" + sale.getInvoiceNumber() + "|"
					+ (sale.getSaleDate() != null ? sale.getSaleDate().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) : "NOW")
					+ "|" + sale.getTotalAmount().toPlainString();

			MessageDigest md = MessageDigest.getInstance("SHA-256");
			byte[] digest = md.digest(raw.getBytes(StandardCharsets.UTF_8));
			StringBuilder sb = new StringBuilder();
			for (byte b : digest) sb.append(String.format("%02X", b));
			String cuf = sb.substring(0, 24);

			return new ElectronicInvoiceResult(true, authNumber, cuf, null);
		} catch (Exception e) {
			log.error("Error al generar CUF para venta {}: {}", sale.getId(), e.getMessage());
			return new ElectronicInvoiceResult(false, null, null, "Error interno al generar CUF: " + e.getMessage());
		}
	}
}
