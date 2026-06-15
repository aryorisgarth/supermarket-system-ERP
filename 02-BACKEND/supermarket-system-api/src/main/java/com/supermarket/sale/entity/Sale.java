package com.supermarket.sale.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.supermarket.cashregister.entity.CashRegisterSession;

import jakarta.persistence.CascadeType;
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
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.supermarket.customer.entity.Customer;
import com.supermarket.sale.model.SaleStatus;
import com.supermarket.user.entity.User;

@Entity
@Table(name = "sales")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Sale {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "customer_id", foreignKey = @jakarta.persistence.ForeignKey(name = "fk_sales_customers"))
	private Customer customer;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", nullable = false, foreignKey = @jakarta.persistence.ForeignKey(name = "fk_sales_users"))
	private User user;

	@NotNull
	@Size(max = 50)
	@Column(name = "invoice_number", nullable = false, unique = true, length = 50)
	private String invoiceNumber;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "session_id", nullable = false, foreignKey = @jakarta.persistence.ForeignKey(name = "fk_sales_session"))
	private CashRegisterSession session;

	@NotNull
	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private SaleStatus status = SaleStatus.PAID;

	@NotNull
	@Column(nullable = false, precision = 12, scale = 4)
	private BigDecimal subtotal;

	@NotNull
	@Column(name = "total_tax", nullable = false, precision = 12, scale = 4)
	private BigDecimal totalTax;

	@NotNull
	@Column(name = "total_amount", nullable = false, precision = 12, scale = 4)
	private BigDecimal totalAmount;

	@NotNull
	@Column(name = "change_amount", nullable = false, precision = 12, scale = 4)
	private BigDecimal changeAmount = BigDecimal.ZERO;

	@Column(name = "points_earned", nullable = false)
	private Integer pointsEarned = 0;

	@Column(name = "points_redeemed", nullable = false)
	private Integer pointsRedeemed = 0;

	@Column(name = "points_value", nullable = false, precision = 12, scale = 4)
	private BigDecimal pointsValue = BigDecimal.ZERO;

	@Column(name = "sale_date", nullable = false, updatable = false)
	private LocalDateTime saleDate;

	@OneToMany(mappedBy = "sale", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<SaleDetail> details = new ArrayList<>();

	@OneToMany(mappedBy = "sale", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<SalePayment> payments = new ArrayList<>();
}
