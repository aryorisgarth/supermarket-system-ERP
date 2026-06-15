package com.supermarket.inventorycount.dto;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InventoryCountSessionRequestDTO {

	@Size(max = 255)
	private String notes;

	@Size(max = 80)
	private String warehouseZone;
}
