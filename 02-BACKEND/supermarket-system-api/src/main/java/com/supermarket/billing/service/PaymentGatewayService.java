package com.supermarket.billing.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.math.RoundingMode;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.supermarket.billing.config.BillingProperties;
import com.supermarket.billing.dto.PaymentGatewayTransactionResponseDTO;
import com.supermarket.billing.entity.PaymentAccount;
import com.supermarket.billing.entity.PaymentGatewayTransaction;
import com.supermarket.billing.model.PaymentGatewayStatus;
import com.supermarket.billing.model.SettlementStatus;
import com.supermarket.billing.provider.MockPaymentGatewayProvider;
import com.supermarket.billing.provider.PaymentGatewayProvider;
import com.supermarket.billing.provider.StripePaymentGatewayProvider;
import com.supermarket.billing.provider.VisanetPaymentGatewayProvider;
import com.supermarket.billing.repository.PaymentGatewayTransactionRepository;
import com.supermarket.sale.entity.Sale;
import com.supermarket.sale.entity.SalePayment;
import com.supermarket.sale.model.PaymentMethod;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PaymentGatewayService {

	private final BillingProperties billingProperties;
	private final PaymentGatewayTransactionRepository transactionRepository;
	private final MockPaymentGatewayProvider mockPaymentGatewayProvider;
	private final StripePaymentGatewayProvider stripePaymentGatewayProvider;
	private final VisanetPaymentGatewayProvider visanetPaymentGatewayProvider;
	private final PaymentAccountService paymentAccountService;

	@Transactional
	public List<PaymentGatewayTransactionResponseDTO> captureForSale(Sale sale, List<SalePayment> payments) {
		if (!billingProperties.paymentGateway().enabled()) {
			return List.of();
		}

		PaymentGatewayProvider gateway = resolveGateway();
		String currency = billingProperties.paymentGateway().currency();
		List<PaymentGatewayTransactionResponseDTO> results = new ArrayList<>();

		for (SalePayment payment : payments) {
			if (payment.getPaymentMethod() != PaymentMethod.CARD) {
				continue;
			}

			var auth = gateway.authorize(
					billingProperties.paymentGateway().provider(),
					payment.getAmount(),
					currency);

			PaymentGatewayTransaction tx = new PaymentGatewayTransaction();
			PaymentAccount account = paymentAccountService.resolveDefaultAccount();
			tx.setSale(sale);
			tx.setPaymentAccount(account);
			tx.setProviderCode(gateway.providerCode());
			tx.setAmount(payment.getAmount());
			tx.setCurrency(currency);
			tx.setPaymentMethod(payment.getPaymentMethod().name());
			tx.setCreatedAt(LocalDateTime.now());
			if (account != null) {
				var commission = payment.getAmount()
						.multiply(account.getCommissionPercentage())
						.divide(java.math.BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
				tx.setCommissionAmount(commission);
				tx.setNetAmount(payment.getAmount().subtract(commission));
				tx.setExpectedSettlementDate(LocalDateTime.now().toLocalDate().plusDays(account.getSettlementDays()));
			} else {
				tx.setCommissionAmount(java.math.BigDecimal.ZERO);
				tx.setNetAmount(payment.getAmount());
			}

			if (auth.approved()) {
				tx.setStatus(PaymentGatewayStatus.APPROVED);
				tx.setExternalReference(auth.externalReference());
				tx.setRawResponse(auth.rawResponse());
			} else {
				tx.setStatus(PaymentGatewayStatus.DECLINED);
				tx.setRawResponse("{\"error\":\"" + auth.errorMessage() + "\"}");
				transactionRepository.save(tx);
				throw new ResponseStatusException(HttpStatus.PAYMENT_REQUIRED,
						"Pago con tarjeta rechazado: " + auth.errorMessage());
			}

			transactionRepository.save(tx);
			results.add(toDto(tx));
		}

		return results;
	}

	public List<PaymentGatewayTransactionResponseDTO> findBySaleId(Long saleId) {
		return transactionRepository.findBySaleIdOrderByCreatedAtDesc(saleId).stream()
				.map(PaymentGatewayService::toDto)
				.toList();
	}

	public List<PaymentGatewayTransactionResponseDTO> findAll() {
		return transactionRepository.findAllByOrderByCreatedAtDesc().stream()
				.map(PaymentGatewayService::toDto)
				.toList();
	}

	@Transactional
	public PaymentGatewayTransactionResponseDTO settle(Long id) {
		PaymentGatewayTransaction tx = transactionRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found"));

		if (tx.getStatus() != PaymentGatewayStatus.APPROVED) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only approved transactions can be settled");
		}

		tx.setSettlementStatus(SettlementStatus.SETTLED);
		return toDto(transactionRepository.save(tx));
	}

	private PaymentGatewayProvider resolveGateway() {
		String provider = billingProperties.paymentGateway().provider();
		if ("STRIPE".equalsIgnoreCase(provider)) {
			return stripePaymentGatewayProvider;
		}
		if ("VISANET".equalsIgnoreCase(provider)) {
			return visanetPaymentGatewayProvider;
		}
		return mockPaymentGatewayProvider;
	}

	private static PaymentGatewayTransactionResponseDTO toDto(PaymentGatewayTransaction tx) {
		return new PaymentGatewayTransactionResponseDTO(
				tx.getId(),
				tx.getSale().getId(),
				tx.getProviderCode(),
				tx.getExternalReference(),
				tx.getPaymentAccount() != null ? tx.getPaymentAccount().getId() : null,
				tx.getPaymentAccount() != null ? tx.getPaymentAccount().getName() : null,
				tx.getPaymentAccount() != null ? mask(tx.getPaymentAccount().getAccountNumber()) : null,
				tx.getAmount(),
				tx.getCommissionAmount(),
				tx.getNetAmount(),
				tx.getCurrency(),
				tx.getStatus(),
				tx.getPaymentMethod(),
				tx.getSettlementStatus() != null ? tx.getSettlementStatus().name() : null,
				tx.getExpectedSettlementDate(),
				tx.getCreatedAt());
	}

	private static String mask(String accountNumber) {
		if (accountNumber == null || accountNumber.length() <= 4) {
			return "****";
		}
		return "****" + accountNumber.substring(accountNumber.length() - 4);
	}
}
