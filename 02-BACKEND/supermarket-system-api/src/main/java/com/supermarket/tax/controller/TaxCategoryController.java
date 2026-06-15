package com.supermarket.tax.controller;

import java.util.List;

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
import org.springframework.web.bind.annotation.RestController;

import com.supermarket.tax.dto.TaxCategoryRequestDTO;
import com.supermarket.tax.dto.TaxCategoryResponseDTO;
import com.supermarket.tax.service.TaxCategoryService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/tax-categories")
@Validated
@RequiredArgsConstructor
@Tag(name = "Categorías de Impuesto", description = "CRUD de categorías de IVA (ej: IVA 15%, Exento)")
@SecurityRequirement(name = "bearerAuth")
public class TaxCategoryController {

	private final TaxCategoryService taxCategoryService;

	@GetMapping
	public ResponseEntity<List<TaxCategoryResponseDTO>> findAll() {
		return ResponseEntity.ok(taxCategoryService.findAll());
	}

	@GetMapping("/active")
	public ResponseEntity<List<TaxCategoryResponseDTO>> findActive() {
		return ResponseEntity.ok(taxCategoryService.findActive());
	}

	@GetMapping("/{id}")
	public ResponseEntity<TaxCategoryResponseDTO> findById(@PathVariable Integer id) {
		return ResponseEntity.ok(taxCategoryService.findById(id));
	}

	@PostMapping
	public ResponseEntity<TaxCategoryResponseDTO> create(@Valid @RequestBody TaxCategoryRequestDTO request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(taxCategoryService.create(request));
	}

	@PutMapping("/{id}")
	public ResponseEntity<TaxCategoryResponseDTO> update(@PathVariable Integer id, @Valid @RequestBody TaxCategoryRequestDTO request) {
		return ResponseEntity.ok(taxCategoryService.update(id, request));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(@PathVariable Integer id) {
		taxCategoryService.delete(id);
		return ResponseEntity.noContent().build();
	}
}
