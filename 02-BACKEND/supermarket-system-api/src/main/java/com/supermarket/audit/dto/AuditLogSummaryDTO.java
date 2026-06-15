package com.supermarket.audit.dto;

public record AuditLogSummaryDTO(
		long totalLogs,
		long todayLogs,
		long deleteLogs,
		long highRiskLogs,
		long activeUsers,
		String mostAffectedTable) {
}
