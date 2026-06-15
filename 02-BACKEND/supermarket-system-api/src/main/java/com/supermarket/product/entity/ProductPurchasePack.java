package com.supermarket.product.entity;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = "product_purchase_packs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductPurchasePack {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "product_id", nullable = false)
	private Product product;

	@Column(nullable = false, length = 40)
	private String label;

	@Column(nullable = false, precision = 12, scale = 4)
	private BigDecimal factor;

	@Column(name = "is_default", nullable = false)
	private Boolean isDefault = false;

	@Column(name = "sort_order", nullable = false)
	private Integer sortOrder = 0;
}
