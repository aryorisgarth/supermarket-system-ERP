package com.supermarket.brand.controller;

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
import com.supermarket.brand.dto.BrandRequestDTO;
import com.supermarket.brand.dto.BrandResponseDTO;
import com.supermarket.brand.service.BrandService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/brands")
@Validated
@RequiredArgsConstructor
public class BrandController {

	private final BrandService brandService;

	@GetMapping
	public ResponseEntity<Page<BrandResponseDTO>> listBrands(
			@RequestParam(required = false) String q,
			@PageableDefault(size = 20, sort = "name") Pageable pageable) {
		return ResponseEntity.ok(brandService.findPage(q, pageable));
	}

	@GetMapping("/all")
	public ResponseEntity<List<BrandResponseDTO>> listAllBrands() {
		return ResponseEntity.ok(brandService.findAll());
	}

	@GetMapping("/{id}")
	public ResponseEntity<BrandResponseDTO> getBrand(@PathVariable Long id) {
		return ResponseEntity.ok(brandService.findById(id));
	}

	@PostMapping
	public ResponseEntity<BrandResponseDTO> createBrand(@Valid @RequestBody BrandRequestDTO request) {
		BrandResponseDTO created = brandService.create(request);
		URI location = ServletUriComponentsBuilder.fromCurrentRequest()
				.path("/{id}")
				.buildAndExpand(created.id())
				.toUri();
		return ResponseEntity.status(HttpStatus.CREATED).location(location).body(created);
	}

	@PutMapping("/{id}")
	public ResponseEntity<BrandResponseDTO> updateBrand(@PathVariable Long id,
			@Valid @RequestBody BrandRequestDTO request) {
		return ResponseEntity.ok(brandService.update(id, request));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteBrand(@PathVariable Long id) {
		brandService.deleteById(id);
		return ResponseEntity.noContent().build();
	}
}
