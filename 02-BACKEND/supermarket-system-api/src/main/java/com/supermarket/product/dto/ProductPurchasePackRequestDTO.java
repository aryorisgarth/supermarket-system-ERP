package com.supermarket.product.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductPurchasePackRequestDTO {

	@NotBlank
	@Size(max = 40)
	private String label;

	@NotNull
	@DecimalMin(value = "0.0", inclusive = false)
	private BigDecimal factor;

	@Size(max = 80)
	private String barcode;

	private Boolean isDefault = false;

	private Integer sortOrder = 0;
}
