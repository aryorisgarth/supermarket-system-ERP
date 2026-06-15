package com.supermarket.purchase.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.supermarket.purchase.model.PurchaseOrderStatus;
import com.supermarket.supplier.entity.Supplier;
import com.supermarket.user.entity.User;

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
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "purchase_orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrder {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "order_number", nullable = false, unique = true, length = 40)
	private String orderNumber;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private PurchaseOrderStatus status = PurchaseOrderStatus.DRAFT;

	@Column(nullable = false, precision = 12, scale = 4)
	private BigDecimal subtotal = BigDecimal.ZERO;

	@Column(length = 255)
	private String notes;

	@Column(name = "ordered_at")
	private LocalDateTime orderedAt;

	@Column(name = "received_at")
	private LocalDateTime receivedAt;

	@Column(name = "created_at", nullable = false, updatable = false)
	private LocalDateTime createdAt;

	@Column(name = "updated_at", nullable = false)
	private LocalDateTime updatedAt;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "supplier_id", nullable = false)
	private Supplier supplier;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "created_by_id", nullable = false)
	private User createdBy;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "received_by_id")
	private User receivedBy;

	@OneToMany(mappedBy = "purchaseOrder", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<PurchaseOrderItem> items = new ArrayList<>();
}
