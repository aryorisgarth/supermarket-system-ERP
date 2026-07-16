package com.supermarket.producthistory.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.supermarket.product.entity.Product;
import com.supermarket.producthistory.model.ProductCostHistoryReason;
import com.supermarket.producthistory.model.ProductCostMethod;
import com.supermarket.supplier.entity.Supplier;
import com.supermarket.user.entity.User;

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
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "product_cost_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductCostHistory {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "product_id", nullable = false)
	private Product product;

	@Column(name = "purchase_order_id")
	private Long purchaseOrderId;

	@Column(name = "purchase_order_item_id")
	private Long purchaseOrderItemId;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "supplier_id")
	private Supplier supplier;

	@Column(name = "previous_last_cost", precision = 12, scale = 4)
	private BigDecimal previousLastCost;

	@Column(name = "new_last_cost", nullable = false, precision = 12, scale = 4)
	private BigDecimal newLastCost;

	@Column(name = "previous_average_cost", precision = 12, scale = 4)
	private BigDecimal previousAverageCost;

	@Column(name = "new_average_cost", nullable = false, precision = 12, scale = 4)
	private BigDecimal newAverageCost;

	@Column(name = "quantity_before", nullable = false, precision = 12, scale = 4)
	private BigDecimal quantityBefore;

	@Column(name = "quantity_received", nullable = false, precision = 12, scale = 4)
	private BigDecimal quantityReceived;

	@Column(name = "quantity_after", nullable = false, precision = 12, scale = 4)
	private BigDecimal quantityAfter;

	@Enumerated(EnumType.STRING)
	@Column(name = "cost_method", nullable = false, length = 40)
	private ProductCostMethod costMethod;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 40)
	private ProductCostHistoryReason reason;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id")
	private User user;

	@Column(name = "created_at", nullable = false, updatable = false)
	private LocalDateTime createdAt;
}
