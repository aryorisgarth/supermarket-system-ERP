package com.supermarket.purchase.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PurchaseOrderAssignRequestDTO {

	@NotNull(message = "El ID del usuario es obligatorio para asignar la orden")
	private Long userId;

}
