package com.supermarket.inventory.dto;

import java.math.BigDecimal;

import com.supermarket.inventory.model.InventoryMovementType;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InventoryMovementRequestDTO {

	@NotNull
	private Long productId;

	private Long batchId;

	@NotNull
	private InventoryMovementType movementType;

	@NotNull
	@DecimalMin(value = "0.0", inclusive = false)
	private BigDecimal quantity;

	
	@NotNull
	@Min(-1)
	@Max(1)
	private Byte factor;

	private Long referenceId;

	@Size(max = 255)
	private String notes;
}
