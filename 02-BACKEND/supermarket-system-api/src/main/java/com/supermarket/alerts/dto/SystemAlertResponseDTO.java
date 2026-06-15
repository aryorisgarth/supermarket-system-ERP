package com.supermarket.alerts.dto;

import java.time.LocalDateTime;

import com.supermarket.user.dto.UserSummaryDTO;

public record SystemAlertResponseDTO(
		Long id,
		String alertKey,
		String type,
		String severity,
		String status,
		String title,
		String message,
		String sourceModule,
		Long referenceId,
		String actionPath,
		LocalDateTime createdAt,
		LocalDateTime updatedAt,
		LocalDateTime resolvedAt,
		UserSummaryDTO resolvedBy) {
}
