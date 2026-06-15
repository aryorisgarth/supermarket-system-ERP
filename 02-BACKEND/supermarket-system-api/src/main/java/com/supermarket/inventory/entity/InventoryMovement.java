package com.supermarket.inventory.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

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
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.supermarket.inventory.model.InventoryMovementType;
import com.supermarket.product.entity.Product;
import com.supermarket.product.entity.ProductUomConversion;
import com.supermarket.productbatch.entity.ProductBatch;
import com.supermarket.user.entity.User;

@Entity
@Table(name = "inventory_movements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InventoryMovement {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "product_id", nullable = false, foreignKey = @jakarta.persistence.ForeignKey(name = "fk_inventory_product"))
	private Product product;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "batch_id", foreignKey = @jakarta.persistence.ForeignKey(name = "fk_inventory_batch"))
	private ProductBatch batch;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "uom_conversion_id")
	private ProductUomConversion uomConversion;

	@Size(max = 40)
	@Column(name = "uom_label", length = 40)
	private String uomLabel;

	@Column(name = "uom_factor", precision = 12, scale = 4)
	private BigDecimal uomFactor;

	@Column(name = "uom_quantity", precision = 12, scale = 4)
	private BigDecimal uomQuantity;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", nullable = false, foreignKey = @jakarta.persistence.ForeignKey(name = "fk_inventory_user"))
	private User user;

	@NotNull
	@Enumerated(EnumType.STRING)
	@Column(name = "movement_type", nullable = false, length = 20)
	private InventoryMovementType movementType;

	@NotNull
	@DecimalMin(value = "0.0", inclusive = false)
	@Column(nullable = false, precision = 12, scale = 4)
	private BigDecimal quantity;

	@NotNull
	@Column(nullable = false, columnDefinition = "TINYINT")
	private Byte factor;

	@Column(name = "reference_id")
	private Long referenceId;

	@Column(name = "previous_stock", precision = 12, scale = 4)
	private BigDecimal previousStock;

	@Column(name = "new_stock", precision = 12, scale = 4)
	private BigDecimal newStock;

	@Column(name = "unit_cost", precision = 12, scale = 4)
	private BigDecimal unitCost;

	@Column(name = "total_cost", precision = 12, scale = 4)
	private BigDecimal totalCost;

	@Size(max = 30)
	@Column(name = "source_type", length = 30)
	private String sourceType;

	@Column(name = "reference_line_id")
	private Long referenceLineId;

	@Size(max = 255)
	@Column(length = 255)
	private String notes;

	@Column(name = "created_at", nullable = false, updatable = false)
	private LocalDateTime createdAt;
}
