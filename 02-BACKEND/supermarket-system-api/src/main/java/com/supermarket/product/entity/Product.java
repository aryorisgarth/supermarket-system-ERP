package com.supermarket.product.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.supermarket.brand.entity.Brand;

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

import com.supermarket.category.entity.Category;
import com.supermarket.supplier.entity.Supplier;
import com.supermarket.tax.entity.TaxCategory;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Product {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@NotBlank
	@Size(max = 50)
	@Column(nullable = false, length = 50, unique = true)
	private String barcode;

	@NotBlank
	@Size(max = 100)
	@Column(nullable = false, length = 100)
	private String name;

	@Column(columnDefinition = "TEXT")
	private String description;

	@NotNull
	@DecimalMin(value = "0.0", inclusive = false)
	@Column(nullable = false, precision = 12, scale = 4)
	private BigDecimal purchasePrice;

	@NotNull
	@DecimalMin(value = "0.0", inclusive = false)
	@Column(nullable = false, precision = 12, scale = 4)
	private BigDecimal salePrice;

	@NotNull
	@DecimalMin(value = "0.0", inclusive = true)
	@Column(nullable = false, precision = 12, scale = 4)
	private BigDecimal currentStock = BigDecimal.ZERO;

	@NotNull
	@DecimalMin(value = "0.0", inclusive = false)
	@Column(nullable = false, precision = 12, scale = 4)
	private BigDecimal minimumStock = new BigDecimal("5.0000");

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "tax_category_id", nullable = false, foreignKey = @jakarta.persistence.ForeignKey(name = "fk_products_taxes"))
	private TaxCategory taxCategory;

	@Column(nullable = false)
	private Boolean isActive = true;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "category_id", nullable = false, foreignKey = @jakarta.persistence.ForeignKey(name = "fk_products_categories"))
	private Category category;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "supplier_id", nullable = false, foreignKey = @jakarta.persistence.ForeignKey(name = "fk_products_suppliers"))
	private Supplier supplier;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "brand_id", foreignKey = @jakarta.persistence.ForeignKey(name = "fk_products_brand_id"))
	private Brand brand;

	@NotBlank
	@Size(max = 10)
	@Column(nullable = false, length = 10)
	private String uomBase = "UN";

	@jakarta.persistence.OneToMany(mappedBy = "product", fetch = FetchType.LAZY, cascade = jakarta.persistence.CascadeType.ALL, orphanRemoval = true)
	private List<ProductUomConversion> uomConversions = new ArrayList<>();

	@Column(name = "created_at", nullable = false, updatable = false)
	private LocalDateTime createdAt;

	@Column(name = "updated_at", nullable = false)
	private LocalDateTime updatedAt;

	@Column(name = "requires_batch", nullable = false)
	private Boolean requiresBatch = false;

	@Column(name = "requires_expiration", nullable = false)
	private Boolean requiresExpiration = false;

	@NotNull
	@Column(name = "min_stock_exhibicion", nullable = false, precision = 12, scale = 4)
	private BigDecimal minStockExhibicion = new BigDecimal("5.0000");

	@jakarta.persistence.OneToMany(mappedBy = "product", fetch = FetchType.LAZY, cascade = jakarta.persistence.CascadeType.ALL, orphanRemoval = true)
	private List<ProductLocation> productLocations = new ArrayList<>();
}

