package com.supermarket.supplier.controller;

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

import com.supermarket.supplier.dto.SupplierRequestDTO;
import com.supermarket.supplier.dto.SupplierResponseDTO;
import com.supermarket.supplier.service.SupplierService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/suppliers")
@Validated
@RequiredArgsConstructor
public class SupplierController {

	private final SupplierService supplierService;

	@GetMapping
	public ResponseEntity<Page<SupplierResponseDTO>> listSuppliers(
			@RequestParam(required = false) String q,
			@PageableDefault(size = 20, sort = "companyName") Pageable pageable) {
		return ResponseEntity.ok(supplierService.findPage(q, pageable));
	}

	@GetMapping("/search")
	public ResponseEntity<List<SupplierResponseDTO>> searchSuppliers(@RequestParam String q) {
		return ResponseEntity.ok(supplierService.searchSuppliers(q));
	}

	@GetMapping("/{id}")
	public ResponseEntity<SupplierResponseDTO> getSupplier(@PathVariable Integer id) {
		return ResponseEntity.ok(supplierService.findById(id));
	}

	@PostMapping
	public ResponseEntity<SupplierResponseDTO> createSupplier(@Valid @RequestBody SupplierRequestDTO request) {
		SupplierResponseDTO created = supplierService.create(request);
		URI location = ServletUriComponentsBuilder.fromCurrentRequest()
				.path("/{id}")
				.buildAndExpand(created.id())
				.toUri();
		return ResponseEntity.status(HttpStatus.CREATED).location(location).body(created);
	}

	@PutMapping("/{id}")
	public ResponseEntity<SupplierResponseDTO> updateSupplier(@PathVariable Integer id,
			@Valid @RequestBody SupplierRequestDTO request) {
		return ResponseEntity.ok(supplierService.update(id, request));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteSupplier(@PathVariable Integer id) {
		supplierService.deleteById(id);
		return ResponseEntity.noContent().build();
	}
}
