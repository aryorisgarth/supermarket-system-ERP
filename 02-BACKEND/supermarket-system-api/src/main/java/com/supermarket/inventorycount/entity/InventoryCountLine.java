package com.supermarket.inventorycount.entity;

import java.math.BigDecimal;

import com.supermarket.product.entity.Product;
import com.supermarket.product.entity.ProductUomConversion;
import com.supermarket.productbatch.entity.ProductBatch;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "inventory_count_lines", uniqueConstraints = {
		@UniqueConstraint(name = "uq_count_line_session_product_batch", columnNames = { "session_id", "product_id", "batch_id" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InventoryCountLine {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "session_id", nullable = false)
	private InventoryCountSession session;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "product_id", nullable = false)
	private Product product;

	@Column(length = 50)
	private String barcode;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "uom_conversion_id")
	private ProductUomConversion uomConversion;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "batch_id")
	private ProductBatch batch;

	@Column(name = "system_quantity", nullable = false, precision = 12, scale = 4)
	private BigDecimal systemQuantity;

	@Column(name = "counted_quantity", nullable = false, precision = 12, scale = 4)
	private BigDecimal countedQuantity;

	@Column(nullable = false, precision = 12, scale = 4)
	private BigDecimal variance;

	@Column(length = 255)
	private String notes;
}
