package com.supermarket.purchase.controller;

import java.util.List;

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

import com.supermarket.purchase.dto.PurchaseOrderAssignRequestDTO;
import com.supermarket.purchase.dto.PurchaseOrderRequestDTO;
import com.supermarket.purchase.dto.PurchaseOrderResponseDTO;
import com.supermarket.purchase.dto.PurchaseReceiptRequestDTO;
import com.supermarket.purchase.model.PurchaseOrderStatus;
import com.supermarket.purchase.service.PurchaseOrderService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/purchase-orders")
@Validated
@RequiredArgsConstructor
public class PurchaseOrderController {

	private final PurchaseOrderService purchaseOrderService;

	@GetMapping
	public ResponseEntity<Page<PurchaseOrderResponseDTO>> list(
			@RequestParam(required = false) PurchaseOrderStatus status,
			@RequestParam(required = false) Long supplierId,
			@RequestParam(required = false) String q,
			@PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
		return ResponseEntity.ok(purchaseOrderService.findPage(status, supplierId, q, pageable));
	}

	@GetMapping("/{id}")
	public ResponseEntity<PurchaseOrderResponseDTO> findById(@PathVariable Long id) {
		return ResponseEntity.ok(purchaseOrderService.findById(id));
	}

	@PostMapping
	public ResponseEntity<PurchaseOrderResponseDTO> create(@Valid @RequestBody PurchaseOrderRequestDTO request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(purchaseOrderService.create(request));
	}

	@PostMapping("/{id}/order")
	public ResponseEntity<PurchaseOrderResponseDTO> markOrdered(@PathVariable Long id) {
		return ResponseEntity.ok(purchaseOrderService.markOrdered(id));
	}

	@PostMapping("/{id}/receive")
	public ResponseEntity<PurchaseOrderResponseDTO> receive(
			@PathVariable Long id,
			@Valid @RequestBody(required = false) PurchaseReceiptRequestDTO request) {
		return ResponseEntity.ok(request == null
				? purchaseOrderService.receive(id)
				: purchaseOrderService.receive(id, request));
	}

	@PostMapping("/{id}/claim")
	public ResponseEntity<PurchaseOrderResponseDTO> claim(@PathVariable Long id) {
		return ResponseEntity.ok(purchaseOrderService.claim(id));
	}

	@PostMapping("/{id}/assign")
	public ResponseEntity<PurchaseOrderResponseDTO> assign(
			@PathVariable Long id,
			@Valid @RequestBody PurchaseOrderAssignRequestDTO request) {
		return ResponseEntity.ok(purchaseOrderService.assign(id, request.getUserId()));
	}

	@PostMapping("/{id}/cancel")
	public ResponseEntity<PurchaseOrderResponseDTO> cancel(@PathVariable Long id) {
		return ResponseEntity.ok(purchaseOrderService.cancel(id));
	}
}
