package com.supermarket.alerts.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class NotificationRuleRequestDTO {

	@NotBlank(message = "El tipo de alerta es obligatorio")
	private String alertType;

	@NotBlank(message = "La severidad es obligatoria")
	private String severity;

	@NotBlank(message = "El canal es obligatorio")
	private String channel;

	@NotNull(message = "El ID del rol es obligatorio")
	private Byte roleId;
}
