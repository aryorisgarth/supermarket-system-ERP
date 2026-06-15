package com.supermarket.purchase.entity;

import java.math.BigDecimal;

import com.supermarket.product.entity.Product;
import com.supermarket.product.entity.ProductUomConversion;

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
@Table(name = "purchase_order_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrderItem {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "quantity_ordered", nullable = false, precision = 12, scale = 4)
	private BigDecimal quantityOrdered;

	@Column(name = "quantity_received", nullable = false, precision = 12, scale = 4)
	private BigDecimal quantityReceived = BigDecimal.ZERO;

	@Column(name = "unit_cost", nullable = false, precision = 12, scale = 4)
	private BigDecimal unitCost;

	@Column(name = "line_total", nullable = false, precision = 12, scale = 4)
	private BigDecimal lineTotal;

	@Column(name = "pack_label", length = 40)
	private String packLabel;

	@Column(name = "quantity_in_packs", precision = 12, scale = 4)
	private BigDecimal quantityInPacks;

	@Column(name = "cost_per_pack", precision = 12, scale = 4)
	private BigDecimal costPerPack;

	@Column(name = "units_per_pack", precision = 12, scale = 4)
	private BigDecimal unitsPerPack;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "purchase_order_id", nullable = false)
	private PurchaseOrder purchaseOrder;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "product_id", nullable = false)
	private Product product;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "uom_conversion_id")
	private ProductUomConversion uomConversion;
}
