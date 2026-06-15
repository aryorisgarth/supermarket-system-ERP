package com.supermarket.alerts.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.supermarket.alerts.dto.SystemAlertResponseDTO;
import com.supermarket.alerts.service.SystemAlertService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/system-alerts")
@RequiredArgsConstructor
public class SystemAlertController {

	private final SystemAlertService systemAlertService;

	@GetMapping
	public ResponseEntity<Page<SystemAlertResponseDTO>> list(
			@RequestParam(required = false) String status,
			@RequestParam(required = false) String type,
			@RequestParam(required = false) String q,
			@PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
		return ResponseEntity.ok(systemAlertService.findPage(status, type, q, pageable));
	}

	@PostMapping("/generate")
	public ResponseEntity<List<SystemAlertResponseDTO>> generate() {
		return ResponseEntity.ok(systemAlertService.generate());
	}

	@PostMapping("/{id}/resolve")
	public ResponseEntity<SystemAlertResponseDTO> resolve(@PathVariable Long id) {
		return ResponseEntity.ok(systemAlertService.resolve(id));
	}
}
