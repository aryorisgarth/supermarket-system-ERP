package com.supermarket.cashregister.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

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
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.supermarket.cashregister.model.SessionStatus;
import com.supermarket.user.entity.User;

@Entity
@Table(name = "cash_register_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CashRegisterSession {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", nullable = false, foreignKey = @jakarta.persistence.ForeignKey(name = "fk_cash_session_users"))
	private User cashier;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "cash_register_id", foreignKey = @jakarta.persistence.ForeignKey(name = "fk_sessions_cash_registers"))
	private CashRegister cashRegister;

	@NotNull
	@Column(name = "opened_at", nullable = false, updatable = false)
	private LocalDateTime openedAt;

	@Column(name = "closed_at")
	private LocalDateTime closedAt;

	@NotNull
	@DecimalMin(value = "0.0", inclusive = true)
	@Column(name = "opening_balance", nullable = false, precision = 12, scale = 4)
	private BigDecimal openingBalance = BigDecimal.ZERO;

	@DecimalMin(value = "0.0", inclusive = true)
	@Column(name = "system_calculated_balance", precision = 12, scale = 4)
	private BigDecimal systemCalculatedBalance;

	@DecimalMin(value = "0.0", inclusive = true)
	@Column(name = "actual_closing_balance", precision = 12, scale = 4)
	private BigDecimal actualClosingBalance;

	@Column(precision = 12, scale = 4)
	private BigDecimal difference;

	@Column(name = "expected_cash", precision = 12, scale = 4)
	private BigDecimal expectedCash;

	@Column(name = "expected_card", precision = 12, scale = 4)
	private BigDecimal expectedCard;

	@Column(name = "expected_transfer", precision = 12, scale = 4)
	private BigDecimal expectedTransfer;

	@Column(name = "counted_cash", precision = 12, scale = 4)
	private BigDecimal countedCash;

	@Column(name = "counted_card", precision = 12, scale = 4)
	private BigDecimal countedCard;

	@Column(name = "counted_transfer", precision = 12, scale = 4)
	private BigDecimal countedTransfer;

	@Column(name = "card_difference", precision = 12, scale = 4)
	private BigDecimal cardDifference;

	@Column(name = "transfer_difference", precision = 12, scale = 4)
	private BigDecimal transferDifference;

	@NotNull
	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private SessionStatus status = SessionStatus.OPEN;

	@Column(columnDefinition = "TEXT")
	private String notes;
}
