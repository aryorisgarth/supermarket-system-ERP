package com.supermarket.product.dto;

import java.math.BigDecimal;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductRequestDTO {

	@NotBlank
	@Size(max = 50)
	@Pattern(regexp = "^[A-Za-z0-9\\-]+$", message = "El código de barras solo puede contener letras, números y guiones.")
	private String barcode;

	@NotBlank
	@Size(max = 100)
	private String name;

	private String description;

	@NotNull
	@DecimalMin(value = "0.0", inclusive = false)
	private BigDecimal purchasePrice;

	@NotNull
	@DecimalMin(value = "0.0", inclusive = false)
	private BigDecimal salePrice;

	@NotNull
	@DecimalMin(value = "0.0", inclusive = true)
	private BigDecimal currentStock = BigDecimal.ZERO;

	@NotNull
	@DecimalMin(value = "0.0", inclusive = false)
	private BigDecimal minimumStock = new BigDecimal("5.0000");

	@NotNull
	private Integer taxCategoryId;

	private Boolean isActive = true;

	@NotNull
	private Short categoryId;

	@NotNull
	private Integer supplierId;

	@Valid
	private List<ProductPurchasePackRequestDTO> purchasePacks;

	private Boolean requiresBatch;

	private Boolean requiresExpiration;

	private Long brandId;

	private BigDecimal minStockExhibicion;
}
