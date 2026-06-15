package com.supermarket.sale.entity;

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
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.supermarket.product.entity.Product;
import com.supermarket.product.entity.ProductUomConversion;
import com.supermarket.productbatch.entity.ProductBatch;

@Entity
@Table(name = "sale_details")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SaleDetail {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "sale_id", nullable = false, foreignKey = @jakarta.persistence.ForeignKey(name = "fk_sale_details_sales"))
	private Sale sale;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "product_id", nullable = false, foreignKey = @jakarta.persistence.ForeignKey(name = "fk_sale_details_products"))
	private Product product;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "batch_id", foreignKey = @jakarta.persistence.ForeignKey(name = "fk_sale_details_batches"))
	private ProductBatch batch;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "uom_conversion_id")
	private ProductUomConversion uomConversion;

	@NotNull
	@DecimalMin(value = "0.0", inclusive = false)
	@Column(nullable = false, precision = 12, scale = 4)
	private BigDecimal quantity;

	@NotNull
	@Column(nullable = false, precision = 12, scale = 4)
	private BigDecimal unitPrice;

	@NotNull
	@Column(name = "tax_applied", nullable = false, precision = 5, scale = 2)
	private BigDecimal taxApplied;

	@NotNull
	@Column(name = "discount_amount", nullable = false, precision = 12, scale = 4)
	private BigDecimal discountAmount = BigDecimal.ZERO;

	@Column(name = "unit_cost", precision = 12, scale = 4)
	private BigDecimal unitCost;

	@Column(name = "gross_profit", precision = 12, scale = 4)
	private BigDecimal grossProfit;

	
	@NotNull
	@Column(nullable = false, precision = 12, scale = 4)
	private BigDecimal subtotal;
}
