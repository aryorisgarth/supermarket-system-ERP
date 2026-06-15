package com.supermarket.inventory.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
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

import com.supermarket.inventory.dto.InventoryMovementRequestDTO;
import com.supermarket.inventory.dto.InventoryMovementResponseDTO;
import com.supermarket.inventory.service.InventoryMovementService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/inventory-movements")
@Validated
@RequiredArgsConstructor
public class InventoryMovementController {

	private final InventoryMovementService inventoryMovementService;

	@GetMapping
	public ResponseEntity<?> list(
			@PageableDefault(size = 50, sort = "createdAt", direction = org.springframework.data.domain.Sort.Direction.DESC) Pageable pageable,
			@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
			@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
		if (from != null && to != null) {
			return ResponseEntity.ok(inventoryMovementService.findBetween(from, to));
		}
		return ResponseEntity.ok(inventoryMovementService.findAll(pageable));
	}

	@GetMapping("/product/{productId}")
	public ResponseEntity<List<InventoryMovementResponseDTO>> byProduct(@PathVariable Long productId) {
		return ResponseEntity.ok(inventoryMovementService.findByProductId(productId));
	}

	@PostMapping
	public ResponseEntity<InventoryMovementResponseDTO> create(@Valid @RequestBody InventoryMovementRequestDTO request) {
		InventoryMovementResponseDTO created = inventoryMovementService.create(request);
		return ResponseEntity.status(HttpStatus.CREATED).body(created);
	}
}
