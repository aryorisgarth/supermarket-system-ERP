package com.supermarket.inventorycount.controller;

import java.net.URI;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.supermarket.inventorycount.dto.InventoryCountScanRequestDTO;
import com.supermarket.inventorycount.dto.InventoryCountSessionRequestDTO;
import com.supermarket.inventorycount.dto.InventoryCountSessionResponseDTO;
import com.supermarket.inventorycount.model.InventoryCountStatus;
import com.supermarket.inventorycount.service.InventoryCountService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/inventory-counts")
@Validated
@RequiredArgsConstructor
public class InventoryCountController {

	private final InventoryCountService inventoryCountService;

	@GetMapping
	public ResponseEntity<Page<InventoryCountSessionResponseDTO>> list(
			@RequestParam(required = false) InventoryCountStatus status,
			@PageableDefault(size = 20, sort = "createdAt", direction = org.springframework.data.domain.Sort.Direction.DESC) Pageable pageable) {
		return ResponseEntity.ok(inventoryCountService.findPage(status, pageable));
	}

	@GetMapping("/{id}")
	public ResponseEntity<InventoryCountSessionResponseDTO> get(@PathVariable Long id) {
		return ResponseEntity.ok(inventoryCountService.findById(id));
	}

	@PostMapping
	public ResponseEntity<InventoryCountSessionResponseDTO> create(
			@Valid @RequestBody InventoryCountSessionRequestDTO request) {
		InventoryCountSessionResponseDTO created = inventoryCountService.create(request);
		URI location = ServletUriComponentsBuilder.fromCurrentRequest()
				.path("/{id}")
				.buildAndExpand(created.id())
				.toUri();
		return ResponseEntity.status(HttpStatus.CREATED).location(location).body(created);
	}

	@PostMapping("/{id}/scan")
	public ResponseEntity<InventoryCountSessionResponseDTO> scan(@PathVariable Long id,
			@Valid @RequestBody InventoryCountScanRequestDTO request) {
		return ResponseEntity.ok(inventoryCountService.scan(id, request));
	}

	@PostMapping("/{id}/submit")
	public ResponseEntity<InventoryCountSessionResponseDTO> submit(@PathVariable Long id) {
		return ResponseEntity.ok(inventoryCountService.submit(id));
	}

	@PostMapping("/{id}/approve")
	public ResponseEntity<InventoryCountSessionResponseDTO> approve(@PathVariable Long id) {
		return ResponseEntity.ok(inventoryCountService.approve(id));
	}

	@PostMapping("/{id}/cancel")
	public ResponseEntity<InventoryCountSessionResponseDTO> cancel(@PathVariable Long id) {
		return ResponseEntity.ok(inventoryCountService.cancel(id));
	}

	@PostMapping("/{id}/claim")
	public ResponseEntity<InventoryCountSessionResponseDTO> claim(@PathVariable Long id) {
		return ResponseEntity.ok(inventoryCountService.claim(id));
	}

	@PostMapping("/{id}/assign")
	public ResponseEntity<InventoryCountSessionResponseDTO> assign(
			@PathVariable Long id,
			@Valid @RequestBody com.supermarket.inventorycount.dto.InventoryCountAssignRequestDTO request) {
		return ResponseEntity.ok(inventoryCountService.assign(id, request.getUserId()));
	}
}
