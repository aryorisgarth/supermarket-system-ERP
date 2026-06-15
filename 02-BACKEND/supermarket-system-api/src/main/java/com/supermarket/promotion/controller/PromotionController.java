package com.supermarket.promotion.controller;

import java.net.URI;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

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

import com.supermarket.promotion.dto.AppliedPromotionDTO;
import com.supermarket.promotion.dto.PromotionRequestDTO;
import com.supermarket.promotion.dto.PromotionResponseDTO;
import com.supermarket.promotion.service.PromotionService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/promotions")
@Validated
@RequiredArgsConstructor
@Tag(name = "Promociones", description = "Gestión de descuentos, combos y ofertas por caducidad")
@SecurityRequirement(name = "bearerAuth")
public class PromotionController {

	private final PromotionService promotionService;

	@GetMapping
	@Operation(summary = "Listar todas las promociones (paginado)")
	public ResponseEntity<Page<PromotionResponseDTO>> list(
			@RequestParam(required = false) String q,
			@RequestParam(required = false) Boolean activeOnly,
			@RequestParam(required = false) Boolean inactiveOnly,
			@PageableDefault(size = 20) Pageable pageable) {
		return ResponseEntity.ok(promotionService.findAll(q, activeOnly, inactiveOnly, pageable));
	}

	@GetMapping("/active")
	@Operation(summary = "Listar promociones vigentes hoy")
	public ResponseEntity<List<PromotionResponseDTO>> active() {
		return ResponseEntity.ok(promotionService.findActive());
	}

	@GetMapping("/apply")
	@Operation(summary = "Calcular mejor descuento para un producto",
			description = "Devuelve la promoción con el mayor descuento aplicable. Usado por el POS al añadir al carrito.")
	public ResponseEntity<AppliedPromotionDTO> apply(
			@RequestParam Long productId,
			@RequestParam(defaultValue = "1") BigDecimal quantity,
			@RequestParam(required = false) Long uomConversionId) {
		Optional<AppliedPromotionDTO> result = promotionService.bestPromotion(productId, quantity, uomConversionId);
		return result.map(ResponseEntity::ok)
				.orElse(ResponseEntity.noContent().build());
	}

	@GetMapping("/{id}")
	@Operation(summary = "Obtener promoción por ID")
	public ResponseEntity<PromotionResponseDTO> get(@PathVariable Long id) {
		return ResponseEntity.ok(promotionService.findById(id));
	}

	@PostMapping
	@Operation(summary = "Crear promoción")
	public ResponseEntity<PromotionResponseDTO> create(@Valid @RequestBody PromotionRequestDTO request) {
		PromotionResponseDTO created = promotionService.create(request);
		URI location = ServletUriComponentsBuilder.fromCurrentRequest()
				.path("/{id}").buildAndExpand(created.id()).toUri();
		return ResponseEntity.status(HttpStatus.CREATED).location(location).body(created);
	}

	@PutMapping("/{id}")
	@Operation(summary = "Actualizar promoción")
	public ResponseEntity<PromotionResponseDTO> update(@PathVariable Long id,
			@Valid @RequestBody PromotionRequestDTO request) {
		return ResponseEntity.ok(promotionService.update(id, request));
	}

	@PutMapping("/{id}/toggle")
	@Operation(summary = "Activar/desactivar promoción")
	public ResponseEntity<Void> toggle(@PathVariable Long id) {
		promotionService.toggleActive(id);
		return ResponseEntity.noContent().build();
	}

	@DeleteMapping("/{id}")
	@Operation(summary = "Eliminar promoción")
	public ResponseEntity<Void> delete(@PathVariable Long id) {
		promotionService.delete(id);
		return ResponseEntity.noContent().build();
	}
}
