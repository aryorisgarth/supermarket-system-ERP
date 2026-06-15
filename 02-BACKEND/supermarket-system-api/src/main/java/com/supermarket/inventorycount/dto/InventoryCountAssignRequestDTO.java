package com.supermarket.inventorycount.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class InventoryCountAssignRequestDTO {
	@NotNull(message = "El ID del usuario es obligatorio para reasignar.")
	private Long userId;
}
