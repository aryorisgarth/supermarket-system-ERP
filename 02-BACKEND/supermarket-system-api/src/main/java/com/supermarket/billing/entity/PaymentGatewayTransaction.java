package com.supermarket.billing.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.supermarket.billing.model.PaymentGatewayStatus;
import com.supermarket.billing.model.SettlementStatus;
import com.supermarket.sale.entity.Sale;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "payment_gateway_transactions")
@Getter
@Setter
@NoArgsConstructor
public class PaymentGatewayTransaction {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "sale_id", nullable = false)
	private Sale sale;

	@Column(name = "provider_code", nullable = false, length = 40)
	private String providerCode;

	@Column(name = "external_reference", length = 120)
	private String externalReference;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "payment_account_id")
	private PaymentAccount paymentAccount;

	@Column(nullable = false, precision = 12, scale = 4)
	private BigDecimal amount;

	@Column(nullable = false, length = 3)
	private String currency = "GTQ";

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private PaymentGatewayStatus status = PaymentGatewayStatus.PENDING;

	@Column(name = "payment_method", nullable = false, length = 20)
	private String paymentMethod;

	@Column(name = "raw_response", columnDefinition = "JSON")
	private String rawResponse;

	@Column(name = "commission_amount", precision = 12, scale = 4)
	private BigDecimal commissionAmount;

	@Column(name = "net_amount", precision = 12, scale = 4)
	private BigDecimal netAmount;

	@Enumerated(EnumType.STRING)
	@Column(name = "settlement_status", nullable = false, length = 20)
	private SettlementStatus settlementStatus = SettlementStatus.PENDING;

	@Column(name = "expected_settlement_date")
	private LocalDate expectedSettlementDate;

	@Column(name = "settled_at")
	private LocalDateTime settledAt;

	@Column(name = "created_at", nullable = false)
	private LocalDateTime createdAt;
}
