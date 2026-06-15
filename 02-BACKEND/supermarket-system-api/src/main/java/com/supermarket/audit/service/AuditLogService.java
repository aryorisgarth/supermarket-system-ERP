package com.supermarket.audit.service;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.supermarket.audit.dto.AuditLogResponseDTO;
import com.supermarket.audit.dto.AuditLogSummaryDTO;
import com.supermarket.audit.entity.AuditLog;
import com.supermarket.audit.mapper.AuditLogMapper;
import com.supermarket.audit.repository.AuditLogRepository;
import com.supermarket.user.entity.User;
import com.supermarket.user.repository.UserRepository;

import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuditLogService {

	private final AuditLogRepository auditLogRepository;
	private final AuditLogMapper auditLogMapper;
	private final ObjectMapper objectMapper;
	private final UserRepository userRepository;

	@Transactional(readOnly = true)
	public Page<AuditLogResponseDTO> findAll(Pageable pageable) {
		return auditLogRepository.findAllByOrderByLogDateDesc(pageable).map(auditLogMapper::toResponse);
	}

	@Transactional(readOnly = true)
	public Page<AuditLogResponseDTO> search(String search, String action, String affectedTable,
			LocalDateTime fromDate, LocalDateTime toDate, Pageable pageable) {
		return auditLogRepository.search(search, action, affectedTable, fromDate, toDate, pageable)
				.map(auditLogMapper::toResponse);
	}

	@Transactional(readOnly = true)
	public AuditLogSummaryDTO getSummary() {
		LocalDateTime startOfDay = LocalDateTime.now().with(LocalTime.MIN);
		LocalDateTime endOfDay = LocalDateTime.now().with(LocalTime.MAX);
		List<AuditLog> logs = auditLogRepository.findAllByOrderByLogDateDesc(Pageable.unpaged()).getContent();
		long todayLogs = logs.stream()
				.filter(log -> log.getLogDate() != null
						&& !log.getLogDate().isBefore(startOfDay)
						&& !log.getLogDate().isAfter(endOfDay))
				.count();
		long deleteLogs = logs.stream()
				.filter(log -> isDeleteAction(log.getAction()))
				.count();
		long highRiskLogs = logs.stream()
				.filter(this::isHighRisk)
				.count();
		long activeUsers = logs.stream()
				.filter(log -> log.getUser() != null)
				.map(log -> log.getUser().getId())
				.distinct()
				.count();
		String mostAffectedTable = logs.stream()
				.filter(log -> log.getAffectedTable() != null && !log.getAffectedTable().isBlank())
				.collect(java.util.stream.Collectors.groupingBy(AuditLog::getAffectedTable, java.util.stream.Collectors.counting()))
				.entrySet()
				.stream()
				.max(Map.Entry.comparingByValue())
				.map(Map.Entry::getKey)
				.orElse(null);

		return new AuditLogSummaryDTO(
				logs.size(),
				todayLogs,
				deleteLogs,
				highRiskLogs,
				activeUsers,
				mostAffectedTable);
	}

	private boolean isHighRisk(AuditLog log) {
		if (log == null) {
			return false;
		}
		if (isDeleteAction(log.getAction())) {
			return true;
		}
		if (isOperationalRiskAction(log.getAction())) {
			return true;
		}
		String table = log.getAffectedTable() == null ? "" : log.getAffectedTable().toLowerCase();
		return List.of("users", "user", "roles", "permissions", "payment_accounts", "cash_register_sessions",
				"cash_register_movements")
				.contains(table);
	}

	private boolean isDeleteAction(String action) {
		if (action == null) {
			return false;
		}
		String normalized = action.toUpperCase();
		return "DELETE".equals(normalized) || "REMOVE".equals(normalized) || "SALE_CANCEL".equals(normalized);
	}

	private boolean isOperationalRiskAction(String action) {
		if (action == null) {
			return false;
		}
		String normalized = action.toUpperCase();
		return List.of("ACCESS_DENIED", "CASH_CLOSE", "CASH_MOVEMENT", "INVENTORY_ADJUSTMENT").contains(normalized);
	}

	@Transactional
	public void record(Long userId, String action, String affectedTable, Long recordId, Map<String, Object> oldValues,
			Map<String, Object> newValues) {
		record(userId, action, affectedTable, recordId, oldValues, newValues, currentRequest());
	}

	@Transactional
	public void record(Long userId, String action, String affectedTable, Long recordId, Map<String, Object> oldValues,
			Map<String, Object> newValues, HttpServletRequest request) {
		AuditLog log = new AuditLog();
		if (userId != null) {
			User user = userRepository.findById(userId).orElse(null);
			log.setUser(user);
		}
		log.setAction(action);
		log.setAffectedTable(affectedTable);
		log.setRecordId(recordId);
		log.setOldValues(writeJson(oldValues));
		log.setNewValues(writeJson(newValues));
		if (request != null) {
			log.setIpAddress(request.getRemoteAddr());
		}
		log.setLogDate(LocalDateTime.now());
		auditLogRepository.save(log);
	}

	private static HttpServletRequest currentRequest() {
		var attrs = RequestContextHolder.getRequestAttributes();
		if (attrs instanceof ServletRequestAttributes servletRequestAttributes) {
			return servletRequestAttributes.getRequest();
		}
		return null;
	}

	private String writeJson(Map<String, Object> map) {
		if (map == null || map.isEmpty()) {
			return null;
		}
		try {
			return objectMapper.writeValueAsString(map);
		} catch (JsonProcessingException e) {
			return null;
		}
	}
}
