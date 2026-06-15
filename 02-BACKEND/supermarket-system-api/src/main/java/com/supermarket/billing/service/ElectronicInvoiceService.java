package com.supermarket.billing.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.supermarket.billing.config.BillingProperties;
import com.supermarket.billing.dto.ElectronicInvoiceResponseDTO;
import com.supermarket.billing.entity.ElectronicInvoice;
import com.supermarket.billing.model.BillingCountry;
import com.supermarket.billing.model.ElectronicInvoiceStatus;
import com.supermarket.billing.provider.ElectronicInvoiceProvider;
import com.supermarket.billing.repository.ElectronicInvoiceRepository;
import com.supermarket.customer.entity.Customer;
import com.supermarket.sale.entity.Sale;
import com.supermarket.sale.repository.SaleRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ElectronicInvoiceService {

	private final BillingProperties billingProperties;
	private final ElectronicInvoiceRepository electronicInvoiceRepository;
	private final SaleRepository saleRepository;
	private final List<ElectronicInvoiceProvider> providers;

	@Transactional
	public ElectronicInvoiceResponseDTO issueForSale(Sale sale) {
		if (!billingProperties.electronicInvoice().enabled()) {
			return null;
		}
		if (electronicInvoiceRepository.findBySaleId(sale.getId()).isPresent()) {
			return findBySaleId(sale.getId());
		}

		BillingCountry country = BillingCountry.fromCode(billingProperties.country());
		ElectronicInvoiceProvider provider = providers.stream()
				.filter(p -> p.supports(country))
				.findFirst()
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
						"No hay proveedor de facturación electrónica para el país: " + country));

		String issuerTaxId = billingProperties.electronicInvoice().issuerTaxId();
		String receiverTaxId = resolveReceiverTaxId(sale.getCustomer());

		ElectronicInvoice invoice = new ElectronicInvoice();
		invoice.setSale(sale);
		invoice.setCountryCode(country.name());
		invoice.setProviderCode(provider.getClass().getSimpleName());
		invoice.setIssuerTaxId(issuerTaxId);
		invoice.setReceiverTaxId(receiverTaxId);
		invoice.setCreatedAt(LocalDateTime.now());
		invoice.setStatus(ElectronicInvoiceStatus.PENDING);

		var result = provider.authorize(sale, issuerTaxId, receiverTaxId);
		if (result.success()) {
			invoice.setStatus(ElectronicInvoiceStatus.AUTHORIZED);
			invoice.setAuthorizationNumber(result.authorizationNumber());
			invoice.setFiscalUuid(result.fiscalUuid());
			invoice.setAuthorizedAt(LocalDateTime.now());
		} else {
			invoice.setStatus(ElectronicInvoiceStatus.REJECTED);
			invoice.setErrorMessage(result.errorMessage());
		}

		ElectronicInvoice saved = electronicInvoiceRepository.save(invoice);
		return toDto(saved);
	}

	public ElectronicInvoiceResponseDTO findBySaleId(Long saleId) {
		ElectronicInvoice invoice = electronicInvoiceRepository.findBySaleId(saleId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
						"Factura electrónica no encontrada para la venta"));
		return toDto(invoice);
	}

	@Transactional
	public ElectronicInvoiceResponseDTO issueBySaleId(Long saleId) {
		Sale sale = saleRepository.findById(saleId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Venta no encontrada"));
		ElectronicInvoiceResponseDTO issued = issueForSale(sale);
		if (issued == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
					"La facturación electrónica no está habilitada en la configuración");
		}
		return issued;
	}

	public ElectronicInvoiceResponseDTO findByFiscalUuid(String fiscalUuid) {
		ElectronicInvoice invoice = electronicInvoiceRepository.findByFiscalUuid(fiscalUuid)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
						"Factura electrónica no encontrada para el CUF indicado"));
		return toDto(invoice);
	}

	public Page<ElectronicInvoiceResponseDTO> findAll(String search, Pageable pageable) {
		String normalized = (search != null && !search.isBlank()) ? search.trim() : null;
		if (normalized == null) {
			return electronicInvoiceRepository.findAllByOrderByCreatedAtDesc(pageable).map(ElectronicInvoiceService::toDto);
		}
		return electronicInvoiceRepository.searchPage(normalized, pageable).map(ElectronicInvoiceService::toDto);
	}

	private static String resolveReceiverTaxId(Customer customer) {
		if (customer == null) {
			return "CF";
		}
		if (customer.getDocumentId() != null && !customer.getDocumentId().isBlank()) {
			return customer.getDocumentId().trim();
		}
		return "CF";
	}

	private static ElectronicInvoiceResponseDTO toDto(ElectronicInvoice invoice) {
		return new ElectronicInvoiceResponseDTO(
				invoice.getId(),
				invoice.getSale().getId(),
				invoice.getSale().getInvoiceNumber(),
				invoice.getCountryCode(),
				invoice.getProviderCode(),
				invoice.getStatus(),
				invoice.getAuthorizationNumber(),
				invoice.getFiscalUuid(),
				invoice.getIssuerTaxId(),
				invoice.getReceiverTaxId(),
				invoice.getErrorMessage(),
				invoice.getAuthorizedAt(),
				invoice.getCreatedAt());
	}
}
