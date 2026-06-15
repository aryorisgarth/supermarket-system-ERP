package com.supermarket.sale.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import org.springframework.stereotype.Component;

import com.supermarket.sale.repository.SaleRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class SaleInvoiceNumberGenerator {

	private static final DateTimeFormatter PREFIX_FORMAT = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

	private final SaleRepository saleRepository;

	
	public String next() {
		String prefix = "FAC-" + LocalDateTime.now().format(PREFIX_FORMAT);
		String candidate = prefix;
		int suffix = 1;
		while (saleRepository.existsByInvoiceNumberIgnoreCase(candidate)) {
			candidate = prefix + "-" + suffix++;
		}
		return candidate;
	}
}
