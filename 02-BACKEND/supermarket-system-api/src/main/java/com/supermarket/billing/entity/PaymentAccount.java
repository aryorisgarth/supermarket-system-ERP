package com.supermarket.billing.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "payment_accounts")
@Getter
@Setter
@NoArgsConstructor
public class PaymentAccount {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, length = 100)
	private String name;

	@Column(name = "bank_name", nullable = false, length = 100)
	private String bankName;

	@Column(name = "account_holder", nullable = false, length = 120)
	private String accountHolder;

	@Column(name = "account_number", nullable = false, length = 60)
	private String accountNumber;

	@Column(name = "account_type", nullable = false, length = 30)
	private String accountType;

	@Column(nullable = false, length = 3)
	private String currency = "GTQ";

	@Column(name = "tax_id", length = 30)
	private String taxId;

	@Column(name = "gateway_provider", nullable = false, length = 40)
	private String gatewayProvider = "MOCK";

	@Column(name = "merchant_id", length = 80)
	private String merchantId;

	@Column(name = "terminal_id", length = 80)
	private String terminalId;

	@Column(name = "commission_percentage", nullable = false, precision = 7, scale = 4)
	private BigDecimal commissionPercentage = BigDecimal.ZERO;

	@Column(name = "settlement_days", nullable = false)
	private Integer settlementDays = 2;

	@Column(name = "is_default", nullable = false)
	private Boolean isDefault = false;

	@Column(name = "is_active", nullable = false)
	private Boolean isActive = true;

	@Column(name = "created_at", nullable = false, updatable = false)
	private LocalDateTime createdAt;

	@Column(name = "updated_at", nullable = false)
	private LocalDateTime updatedAt;
}
