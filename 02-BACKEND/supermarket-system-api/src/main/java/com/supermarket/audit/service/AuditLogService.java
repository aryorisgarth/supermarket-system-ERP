package com.supermarket.audit.service;

import java.io.ByteArrayOutputStream;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.supermarket.audit.dto.AuditLogResponseDTO;
import com.supermarket.audit.dto.AuditLogSummaryDTO;
import com.supermarket.audit.entity.AuditLog;
import com.supermarket.audit.mapper.AuditLogMapper;
import com.supermarket.audit.model.AuditActionCategory;
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

	private static final int EXPORT_MAX_ROWS = 10_000;
	private static final DateTimeFormatter CSV_DATE = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

	private final AuditLogRepository auditLogRepository;
	private final AuditLogMapper auditLogMapper;
	private final ObjectMapper objectMapper;
	private final UserRepository userRepository;

	@Transactional(readOnly = true)
	public Page<AuditLogResponseDTO> findAll(Pageable pageable) {
		return auditLogRepository.findAllByOrderByLogDateDesc(pageable).map(auditLogMapper::toResponse);
	}

	@Transactional(readOnly = true)
	public Page<AuditLogResponseDTO> search(String search, String action, String actionCategory,
			String affectedTable, Long userId, LocalDateTime fromDate, LocalDateTime toDate, Pageable pageable) {
		List<String> actionIn = resolveActionFilter(action, actionCategory);
		return auditLogRepository.search(search, action, affectedTable, userId, fromDate, toDate, actionIn, pageable)
				.map(auditLogMapper::toResponse);
	}

	@Transactional(readOnly = true)
	public List<AuditLogResponseDTO> searchForExport(String search, String action, String actionCategory,
			String affectedTable, Long userId, LocalDateTime fromDate, LocalDateTime toDate) {
		List<String> actionIn = resolveActionFilter(action, actionCategory);
		return auditLogRepository
				.search(search, action, affectedTable, userId, fromDate, toDate, actionIn,
						PageRequest.of(0, EXPORT_MAX_ROWS))
				.map(auditLogMapper::toResponse)
				.getContent();
	}

	@Transactional(readOnly = true)
	public ResponseEntity<byte[]> exportCsv(String search, String action, String actionCategory,
			String affectedTable, Long userId, LocalDateTime fromDate, LocalDateTime toDate) {
		List<AuditLogResponseDTO> rows = searchForExport(search, action, actionCategory, affectedTable, userId,
				fromDate, toDate);
		ByteArrayOutputStream buffer = new ByteArrayOutputStream();
		try (OutputStreamWriter writer = new OutputStreamWriter(buffer, StandardCharsets.UTF_8)) {
			writer.write('\uFEFF');
			writer.write("Fecha,Usuario,Rol,Evento,Categoria,Modulo,Registro ID,IP,User-Agent,Valores anteriores,Valores nuevos\n");
			for (AuditLogResponseDTO row : rows) {
				writer.write(String.join(",",
						csv(row.logDate() != null ? CSV_DATE.format(row.logDate()) : ""),
						csv(row.userFullName()),
						csv(row.actor() != null ? row.actor().role() : ""),
						csv(row.action()),
						csv(row.actionCategory()),
						csv(row.affectedTable()),
						csv(row.recordId() != null ? String.valueOf(row.recordId()) : ""),
						csv(row.ipAddress()),
						csv(row.userAgent()),
						csv(row.oldValues()),
						csv(row.newValues())));
				writer.write("\n");
			}
		} catch (Exception ex) {
			throw new IllegalStateException("No se pudo generar la exportación CSV de auditoría", ex);
		}
		String filename = "auditoria_" + LocalDateTime.now().toLocalDate() + ".csv";
		return ResponseEntity.ok()
				.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
				.contentType(new MediaType("text", "csv", StandardCharsets.UTF_8))
				.body(buffer.toByteArray());
	}

	@Transactional(readOnly = true)
	public AuditLogSummaryDTO getSummary() {
		LocalDateTime startOfDay = LocalDateTime.now().with(LocalTime.MIN);
		LocalDateTime endOfDay = LocalDateTime.now().with(LocalTime.MAX);
		long total = auditLogRepository.count();
		long todayLogs = auditLogRepository.countByLogDateBetween(startOfDay, endOfDay);
		long deleteLogs = auditLogRepository.countByActionIn(AuditActionCategory.actionsFor(AuditActionCategory.DELETE));
		long highRiskLogs = auditLogRepository.countHighRiskEvents();
		long activeUsers = auditLogRepository.countDistinctUsers();
		String mostAffectedTable = auditLogRepository.findMostAffectedTables(PageRequest.of(0, 1)).stream()
				.findFirst()
				.map(row -> (String) row[0])
				.orElse(null);

		return new AuditLogSummaryDTO(total, todayLogs, deleteLogs, highRiskLogs, activeUsers, mostAffectedTable);
	}

	private List<String> resolveActionFilter(String action, String actionCategory) {
		if (action != null && !action.isBlank()) {
			return null;
		}
		if (actionCategory == null || actionCategory.isBlank()) {
			return null;
		}
		try {
			AuditActionCategory category = AuditActionCategory.valueOf(actionCategory.trim().toUpperCase());
			List<String> actions = AuditActionCategory.actionsFor(category);
			return actions.isEmpty() ? null : actions;
		} catch (IllegalArgumentException ex) {
			return null;
		}
	}

	private static String csv(String value) {
		if (value == null) {
			return "\"\"";
		}
		return "\"" + value.replace("\"", "\"\"") + "\"";
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
			if (user != null) {
				log.setActorDisplayName(user.getFullName());
				if (user.getRole() != null) {
					log.setActorRoleName(user.getRole().getName());
				}
			}
		}
		log.setAction(action);
		log.setAffectedTable(affectedTable);
		log.setRecordId(recordId);
		log.setOldValues(writeJson(oldValues));
		log.setNewValues(writeJson(newValues));
		if (request != null) {
			log.setIpAddress(resolveClientIp(request));
			log.setUserAgent(truncate(request.getHeader("User-Agent"), 512));
		}
		log.setLogDate(LocalDateTime.now());
		auditLogRepository.save(log);
	}

	private static String resolveClientIp(HttpServletRequest request) {
		String forwarded = request.getHeader("X-Forwarded-For");
		if (forwarded != null && !forwarded.isBlank()) {
			return forwarded.split(",")[0].trim();
		}
		return request.getRemoteAddr();
	}

	private static String truncate(String value, int max) {
		if (value == null || value.length() <= max) {
			return value;
		}
		return value.substring(0, max);
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
