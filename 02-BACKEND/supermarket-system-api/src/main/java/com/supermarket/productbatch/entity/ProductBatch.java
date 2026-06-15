package com.supermarket.productbatch.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
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

import com.supermarket.product.entity.Product;

@Entity
@Table(name = "product_batches")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductBatch {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "product_id", nullable = false, foreignKey = @jakarta.persistence.ForeignKey(name = "fk_batches_products"))
	private Product product;

	@NotBlank
	@Size(max = 50)
	@Column(name = "batch_code", nullable = false, length = 50, unique = true)
	private String batchCode;

	@NotNull
	@DecimalMin(value = "0.0", inclusive = false)
	@Column(name = "initial_quantity", nullable = false, precision = 12, scale = 4)
	private BigDecimal initialQuantity;

	@NotNull
	@DecimalMin(value = "0.0", inclusive = true)
	@Column(name = "current_quantity", nullable = false, precision = 12, scale = 4)
	private BigDecimal currentQuantity;

	@NotNull
	@Column(name = "entry_date", nullable = false)
	private LocalDate entryDate;

	@NotNull
	@Column(name = "expiration_date", nullable = false)
	private LocalDate expirationDate;

	@Column(name = "created_at", nullable = false, updatable = false)
	private LocalDateTime createdAt;

	@Column(name = "purchase_order_item_id")
	private Long purchaseOrderItemId;

	@Size(max = 80)
	@Column(name = "warehouse_zone", length = 80)
	private String warehouseZone;

	@Size(max = 500)
	@Column(name = "qc_notes", length = 500)
	private String qcNotes;
}
