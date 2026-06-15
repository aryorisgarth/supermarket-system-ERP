package com.supermarket.inventorycount.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InventoryCountScanRequestDTO {

	@NotBlank
	@Size(max = 50)
	private String barcode;

	@DecimalMin(value = "0.0", inclusive = false)
	private BigDecimal quantityDelta;

	private Long batchId;

	public InventoryCountScanRequestDTO(String barcode, BigDecimal quantityDelta) {
		this.barcode = barcode;
		this.quantityDelta = quantityDelta;
		this.batchId = null;
	}
}
