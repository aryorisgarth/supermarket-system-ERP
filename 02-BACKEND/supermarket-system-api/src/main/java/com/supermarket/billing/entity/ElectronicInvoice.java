package com.supermarket.billing.entity;

import java.time.LocalDateTime;

import com.supermarket.billing.model.ElectronicInvoiceStatus;
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
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "electronic_invoices")
@Getter
@Setter
@NoArgsConstructor
public class ElectronicInvoice {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@OneToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "sale_id", nullable = false, unique = true)
	private Sale sale;

	@Column(name = "country_code", nullable = false, length = 5)
	private String countryCode;

	@Column(name = "provider_code", nullable = false, length = 40)
	private String providerCode;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private ElectronicInvoiceStatus status = ElectronicInvoiceStatus.PENDING;

	@Column(name = "authorization_number", length = 100)
	private String authorizationNumber;

	@Column(name = "fiscal_uuid", length = 100)
	private String fiscalUuid;

	@Column(name = "issuer_tax_id", nullable = false, length = 30)
	private String issuerTaxId;

	@Column(name = "receiver_tax_id", length = 30)
	private String receiverTaxId;

	@Column(name = "error_message", columnDefinition = "TEXT")
	private String errorMessage;

	@Column(name = "authorized_at")
	private LocalDateTime authorizedAt;

	@Column(name = "created_at", nullable = false)
	private LocalDateTime createdAt;
}
