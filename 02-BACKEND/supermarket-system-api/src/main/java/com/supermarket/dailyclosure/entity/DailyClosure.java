package com.supermarket.dailyclosure.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.supermarket.user.entity.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "daily_closures")
@Getter
@Setter
public class DailyClosure {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "closure_date", nullable = false, unique = true)
	private LocalDate closureDate;

	@Column(name = "total_sales", nullable = false, precision = 12, scale = 4)
	private BigDecimal totalSales = BigDecimal.ZERO;

	@Column(name = "sales_count", nullable = false)
	private Long salesCount = 0L;

	@Column(name = "gross_profit", nullable = false, precision = 12, scale = 4)
	private BigDecimal grossProfit = BigDecimal.ZERO;

	@Column(name = "gross_margin_percentage", nullable = false, precision = 8, scale = 4)
	private BigDecimal grossMarginPercentage = BigDecimal.ZERO;

	@Column(name = "total_cash_sales", nullable = false, precision = 12, scale = 4)
	private BigDecimal totalCashSales = BigDecimal.ZERO;

	@Column(name = "total_card_sales", nullable = false, precision = 12, scale = 4)
	private BigDecimal totalCardSales = BigDecimal.ZERO;

	@Column(name = "total_transfer_sales", nullable = false, precision = 12, scale = 4)
	private BigDecimal totalTransferSales = BigDecimal.ZERO;

	@Column(name = "total_cash_difference", nullable = false, precision = 12, scale = 4)
	private BigDecimal totalCashDifference = BigDecimal.ZERO;

	@Column(name = "total_card_difference", nullable = false, precision = 12, scale = 4)
	private BigDecimal totalCardDifference = BigDecimal.ZERO;

	@Column(name = "total_transfer_difference", nullable = false, precision = 12, scale = 4)
	private BigDecimal totalTransferDifference = BigDecimal.ZERO;

	@Column(name = "total_difference", nullable = false, precision = 12, scale = 4)
	private BigDecimal totalDifference = BigDecimal.ZERO;

	@Column(name = "open_sessions_count", nullable = false)
	private Long openSessionsCount = 0L;

	@Column(name = "closed_sessions_count", nullable = false)
	private Long closedSessionsCount = 0L;

	@Column(name = "received_purchases_amount", nullable = false, precision = 12, scale = 4)
	private BigDecimal receivedPurchasesAmount = BigDecimal.ZERO;

	@Column(name = "pending_purchases_count", nullable = false)
	private Long pendingPurchasesCount = 0L;

	@Column(name = "partial_purchases_count", nullable = false)
	private Long partialPurchasesCount = 0L;

	@Column(name = "pending_settlements_count", nullable = false)
	private Long pendingSettlementsCount = 0L;

	@Column(name = "pending_settlements_amount", nullable = false, precision = 12, scale = 4)
	private BigDecimal pendingSettlementsAmount = BigDecimal.ZERO;

	@Column(name = "stock_alerts_count", nullable = false)
	private Long stockAlertsCount = 0L;

	@Column(name = "alerts_json", columnDefinition = "TEXT")
	private String alertsJson;

	@Column(length = 500)
	private String notes;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "closed_by_id", nullable = false)
	private User closedBy;

	@Column(name = "closed_at", nullable = false)
	private LocalDateTime closedAt;
}
