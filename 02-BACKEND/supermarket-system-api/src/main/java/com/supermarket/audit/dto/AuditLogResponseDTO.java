package com.supermarket.audit.dto;

import java.time.LocalDateTime;

public record AuditLogResponseDTO(
		Long id,
		Long userId,
		String userFullName,
		String action,
		String affectedTable,
		Long recordId,
		String oldValues,
		String newValues,
		String ipAddress,
		LocalDateTime logDate) {
}
