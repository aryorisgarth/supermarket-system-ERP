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
import com.supermarket.productbatch.entity.ProductBatch;

@Entity
@Table(name = "credit_note_details")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreditNoteLine {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "credit_note_id", nullable = false, foreignKey = @jakarta.persistence.ForeignKey(name = "fk_cn_details_credit_note"))
	private CreditNote creditNote;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "sale_detail_id", nullable = false, foreignKey = @jakarta.persistence.ForeignKey(name = "fk_cn_details_sale_detail"))
	private SaleDetail saleDetail;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "product_id", nullable = false, foreignKey = @jakarta.persistence.ForeignKey(name = "fk_cn_details_products"))
	private Product product;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "batch_id", foreignKey = @jakarta.persistence.ForeignKey(name = "fk_cn_details_batches"))
	private ProductBatch batch;

	@NotNull
	@DecimalMin(value = "0.0", inclusive = false)
	@Column(nullable = false, precision = 12, scale = 4)
	private BigDecimal quantity;

	@NotNull
	@Column(name = "unit_price", nullable = false, precision = 12, scale = 4)
	private BigDecimal unitPrice;

	@NotNull
	@Column(name = "tax_applied", nullable = false, precision = 5, scale = 2)
	private BigDecimal taxApplied = BigDecimal.ZERO;

	@NotNull
	@Column(name = "refund_amount", nullable = false, precision = 12, scale = 4)
	private BigDecimal refundAmount;
}
