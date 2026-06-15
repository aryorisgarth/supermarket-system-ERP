package com.supermarket.billing.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.supermarket.billing.dto.PaymentAccountRequestDTO;
import com.supermarket.billing.dto.PaymentAccountResponseDTO;
import com.supermarket.billing.entity.PaymentAccount;
import com.supermarket.billing.repository.PaymentAccountRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PaymentAccountService {

	private final PaymentAccountRepository paymentAccountRepository;

	public List<PaymentAccountResponseDTO> findAll() {
		return paymentAccountRepository.findAllByOrderByIsDefaultDescNameAsc().stream()
				.map(PaymentAccountService::toDto)
				.toList();
	}

	public PaymentAccountResponseDTO findById(Long id) {
		return paymentAccountRepository.findById(id)
				.map(PaymentAccountService::toDto)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment account not found"));
	}

	@Transactional
	public PaymentAccountResponseDTO create(PaymentAccountRequestDTO request) {
		PaymentAccount account = new PaymentAccount();
		if (request.getAccountNumber() == null || request.getAccountNumber().trim().isEmpty()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Account number is required");
		}
		apply(account, request, false);
		account.setCreatedAt(LocalDateTime.now());
		account.setUpdatedAt(LocalDateTime.now());
		PaymentAccount saved = paymentAccountRepository.save(account);
		if (Boolean.TRUE.equals(saved.getIsDefault())) {
			unsetOtherDefaults(saved.getId());
		}
		return toDto(saved);
	}

	@Transactional
	public PaymentAccountResponseDTO update(Long id, PaymentAccountRequestDTO request) {
		PaymentAccount account = paymentAccountRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment account not found"));
		apply(account, request, true);
		account.setUpdatedAt(LocalDateTime.now());
		PaymentAccount saved = paymentAccountRepository.save(account);
		if (Boolean.TRUE.equals(saved.getIsDefault())) {
			unsetOtherDefaults(saved.getId());
		}
		return toDto(saved);
	}

	@Transactional
	public void delete(Long id) {
		if (!paymentAccountRepository.existsById(id)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment account not found");
		}
		paymentAccountRepository.deleteById(id);
	}

	public PaymentAccount resolveDefaultAccount() {
		return paymentAccountRepository.findFirstByIsActiveTrueAndIsDefaultTrueOrderByIdAsc()
				.or(() -> paymentAccountRepository.findFirstByIsActiveTrueOrderByIdAsc())
				.orElse(null);
	}

	private void unsetOtherDefaults(Long defaultId) {
		paymentAccountRepository.findAll().stream()
				.filter(account -> !account.getId().equals(defaultId))
				.filter(account -> Boolean.TRUE.equals(account.getIsDefault()))
				.forEach(account -> {
					account.setIsDefault(false);
					account.setUpdatedAt(LocalDateTime.now());
					paymentAccountRepository.save(account);
				});
	}

	private static void apply(PaymentAccount account, PaymentAccountRequestDTO request, boolean preserveBlankAccountNumber) {
		account.setName(request.getName().trim());
		account.setBankName(request.getBankName().trim());
		account.setAccountHolder(request.getAccountHolder().trim());
		if (!preserveBlankAccountNumber || (request.getAccountNumber() != null && !request.getAccountNumber().trim().isEmpty())) {
			account.setAccountNumber(request.getAccountNumber().trim());
		}
		account.setAccountType(request.getAccountType().trim());
		account.setCurrency(request.getCurrency().trim().toUpperCase());
		account.setTaxId(blankToNull(request.getTaxId()));
		account.setGatewayProvider(request.getGatewayProvider().trim().toUpperCase());
		account.setMerchantId(blankToNull(request.getMerchantId()));
		account.setTerminalId(blankToNull(request.getTerminalId()));
		account.setCommissionPercentage(request.getCommissionPercentage());
		account.setSettlementDays(request.getSettlementDays());
		account.setIsDefault(Boolean.TRUE.equals(request.getIsDefault()));
		account.setIsActive(!Boolean.FALSE.equals(request.getIsActive()));
	}

	private static String blankToNull(String value) {
		if (value == null || value.trim().isEmpty()) {
			return null;
		}
		return value.trim();
	}

	private static PaymentAccountResponseDTO toDto(PaymentAccount account) {
		return new PaymentAccountResponseDTO(
				account.getId(),
				account.getName(),
				account.getBankName(),
				account.getAccountHolder(),
				mask(account.getAccountNumber()),
				account.getAccountType(),
				account.getCurrency(),
				account.getTaxId(),
				account.getGatewayProvider(),
				account.getMerchantId(),
				account.getTerminalId(),
				account.getCommissionPercentage(),
				account.getSettlementDays(),
				account.getIsDefault(),
				account.getIsActive(),
				account.getCreatedAt(),
				account.getUpdatedAt());
	}

	private static String mask(String accountNumber) {
		if (accountNumber == null || accountNumber.length() <= 4) {
			return "****";
		}
		return "****" + accountNumber.substring(accountNumber.length() - 4);
	}
}
