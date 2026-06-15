package com.supermarket.purchase.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PurchaseOrderItemRequestDTO {

	@NotNull
	private Long productId;

	
	private Long purchasePackId;

	private Long uomConversionId;

	@DecimalMin(value = "0.0", inclusive = false)
	private BigDecimal quantityInPacks;

	@DecimalMin(value = "0.0", inclusive = false)
	private BigDecimal costPerPack;

	
	@DecimalMin(value = "0.0", inclusive = false)
	private BigDecimal quantity;

	@DecimalMin(value = "0.0", inclusive = false)
	private BigDecimal unitCost;
}
