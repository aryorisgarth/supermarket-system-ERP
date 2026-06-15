package com.supermarket.product.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "product_uom_conversions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductUomConversion {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "product_id", nullable = false)
	private Product product;

	@NotBlank
	@Size(max = 50)
	@Column(nullable = false, length = 50, unique = true)
	private String barcode;

	@NotBlank
	@Size(max = 40)
	@Column(nullable = false, length = 40)
	private String label;

	@NotNull
	@DecimalMin(value = "0.0", inclusive = false)
	@Column(nullable = false, precision = 12, scale = 4)
	private BigDecimal factor;

	@Column(name = "sale_price", precision = 12, scale = 4)
	private BigDecimal salePrice;

	@Column(name = "is_purchase_default", nullable = false)
	private Boolean isPurchaseDefault = false;

	@Column(name = "is_sale_default", nullable = false)
	private Boolean isSaleDefault = false;

	@Column(name = "created_at", nullable = false, updatable = false)
	private LocalDateTime createdAt = LocalDateTime.now();

	@Column(name = "updated_at", nullable = false)
	private LocalDateTime updatedAt = LocalDateTime.now();
}
