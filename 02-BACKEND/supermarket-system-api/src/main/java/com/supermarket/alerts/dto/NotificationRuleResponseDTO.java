package com.supermarket.alerts.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationRuleResponseDTO {
	private Long id;
	private String alertType;
	private String severity;
	private String channel;
	private Byte roleId;
	private String roleName;
	private Boolean isActive;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
}
