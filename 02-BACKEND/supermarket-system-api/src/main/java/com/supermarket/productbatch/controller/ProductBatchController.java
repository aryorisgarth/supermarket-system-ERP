package com.supermarket.productbatch.controller;

import java.net.URI;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.supermarket.productbatch.dto.BatchExpirySummaryDTO;
import com.supermarket.productbatch.dto.ExpiredWriteOffResultDTO;
import com.supermarket.productbatch.dto.ProductBatchRequestDTO;
import com.supermarket.productbatch.dto.ProductBatchResponseDTO;
import com.supermarket.productbatch.service.ExpiredBatchWriteOffService;
import com.supermarket.productbatch.service.ProductBatchService;
import com.supermarket.security.SecurityUtils;
import com.supermarket.user.entity.User;
import com.supermarket.user.repository.UserRepository;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/product-batches")
@Validated
@RequiredArgsConstructor
public class ProductBatchController {

	private final ProductBatchService productBatchService;
	private final ExpiredBatchWriteOffService expiredBatchWriteOffService;
	private final UserRepository userRepository;

	@GetMapping
	public ResponseEntity<Page<ProductBatchResponseDTO>> listAll(
			@RequestParam(required = false) String q,
			@RequestParam(required = false) String expiryState,
			@PageableDefault(size = 20, sort = "expirationDate") Pageable pageable) {
		return ResponseEntity.ok(productBatchService.findPage(q, expiryState, pageable));
	}

	@GetMapping("/product/{productId}")
	public ResponseEntity<List<ProductBatchResponseDTO>> listByProduct(@PathVariable Long productId) {
		return ResponseEntity.ok(productBatchService.findByProductId(productId));
	}

	@GetMapping("/product/{productId}/search")
	public ResponseEntity<List<ProductBatchResponseDTO>> searchByProduct(@PathVariable Long productId,
			@RequestParam String q) {
		return ResponseEntity.ok(productBatchService.searchByProduct(productId, q));
	}

	@GetMapping("/product/{productId}/expiring")
	public ResponseEntity<List<ProductBatchResponseDTO>> expiring(@PathVariable Long productId,
			@RequestParam(defaultValue = "30") int withinDays) {
		return ResponseEntity.ok(productBatchService.findExpiringSoon(productId, withinDays));
	}

	@GetMapping("/expiring")
	public ResponseEntity<List<ProductBatchResponseDTO>> expiringAll(
			@RequestParam(defaultValue = "30") int withinDays) {
		return ResponseEntity.ok(productBatchService.findAllExpiring(withinDays));
	}

	@GetMapping("/expired")
	public ResponseEntity<List<ProductBatchResponseDTO>> expiredAll() {
		return ResponseEntity.ok(productBatchService.findAllExpired());
	}

	@GetMapping("/summary")
	public ResponseEntity<BatchExpirySummaryDTO> summary() {
		return ResponseEntity.ok(productBatchService.getExpirySummary());
	}

	@PostMapping("/write-off-expired")
	public ResponseEntity<ExpiredWriteOffResultDTO> writeOffExpired() {
		User actor = userRepository.findById(SecurityUtils.currentUserId())
				.orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
						org.springframework.http.HttpStatus.UNAUTHORIZED, "User not found"));
		return ResponseEntity.ok(expiredBatchWriteOffService.writeOffExpired(actor));
	}

	@GetMapping("/{id}")
	public ResponseEntity<ProductBatchResponseDTO> get(@PathVariable Long id) {
		return ResponseEntity.ok(productBatchService.findById(id));
	}

	@PostMapping
	public ResponseEntity<ProductBatchResponseDTO> create(@Valid @RequestBody ProductBatchRequestDTO request) {
		ProductBatchResponseDTO created = productBatchService.create(request);
		URI location = ServletUriComponentsBuilder.fromCurrentRequest()
				.path("/{id}")
				.buildAndExpand(created.id())
				.toUri();
		return ResponseEntity.status(HttpStatus.CREATED).location(location).body(created);
	}

	@PutMapping("/{id}")
	public ResponseEntity<ProductBatchResponseDTO> update(@PathVariable Long id,
			@Valid @RequestBody ProductBatchRequestDTO request) {
		return ResponseEntity.ok(productBatchService.update(id, request));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(@PathVariable Long id) {
		productBatchService.deleteById(id);
		return ResponseEntity.noContent().build();
	}
}
