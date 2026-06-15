package com.supermarket.audit.controller;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.supermarket.audit.dto.AuditLogResponseDTO;
import com.supermarket.audit.dto.AuditLogSummaryDTO;
import com.supermarket.audit.service.AuditLogService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {

	private final AuditLogService auditLogService;

	@GetMapping
	public ResponseEntity<Page<AuditLogResponseDTO>> list(
			@RequestParam(required = false) String search,
			@RequestParam(required = false) String action,
			@RequestParam(required = false) String affectedTable,
			@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
			@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate,
			@PageableDefault(size = 50) Pageable pageable) {
		return ResponseEntity.ok(auditLogService.search(search, action, affectedTable, fromDate, toDate, pageable));
	}

	@GetMapping("/summary")
	public ResponseEntity<AuditLogSummaryDTO> summary() {
		return ResponseEntity.ok(auditLogService.getSummary());
	}
}
