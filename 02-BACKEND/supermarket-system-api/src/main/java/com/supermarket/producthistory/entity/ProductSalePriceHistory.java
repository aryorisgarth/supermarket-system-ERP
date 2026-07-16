package com.supermarket.producthistory.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.supermarket.product.entity.Product;
import com.supermarket.producthistory.model.ProductCostReference;
import com.supermarket.producthistory.model.ProductSalePriceHistoryReason;
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
@Table(name = "product_sale_price_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductSalePriceHistory {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "product_id", nullable = false)
	private Product product;

	@Column(name = "previous_sale_price", nullable = false, precision = 12, scale = 4)
	private BigDecimal previousSalePrice;

	@Column(name = "new_sale_price", nullable = false, precision = 12, scale = 4)
	private BigDecimal newSalePrice;

	@Enumerated(EnumType.STRING)
	@Column(name = "cost_reference", nullable = false, length = 40)
	private ProductCostReference costReference;

	@Column(name = "margin_before_percent", precision = 12, scale = 4)
	private BigDecimal marginBeforePercent;

	@Column(name = "margin_after_percent", precision = 12, scale = 4)
	private BigDecimal marginAfterPercent;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 40)
	private ProductSalePriceHistoryReason reason;

	@Column(length = 255)
	private String notes;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id")
	private User user;

	@Column(name = "created_at", nullable = false, updatable = false)
	private LocalDateTime createdAt;
}
