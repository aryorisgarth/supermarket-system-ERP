package com.supermarket.product.controller;

import java.math.BigDecimal;
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
import com.supermarket.product.dto.LocationRequestDTO;
import com.supermarket.product.dto.LocationResponseDTO;
import com.supermarket.product.dto.ProductLocationResponseDTO;
import com.supermarket.product.service.LocationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/locations")
@Validated
@RequiredArgsConstructor
public class LocationController {

	private final LocationService locationService;

	@GetMapping
	public ResponseEntity<Page<LocationResponseDTO>> listLocations(
			@RequestParam(required = false) String q,
			@PageableDefault(size = 20, sort = "locationCode") Pageable pageable) {
		return ResponseEntity.ok(locationService.findPage(q, pageable));
	}

	@GetMapping("/all")
	public ResponseEntity<List<LocationResponseDTO>> listAllLocations() {
		return ResponseEntity.ok(locationService.findAll());
	}

	@GetMapping("/{id}")
	public ResponseEntity<LocationResponseDTO> getLocation(@PathVariable Long id) {
		return ResponseEntity.ok(locationService.findById(id));
	}

	@PostMapping
	public ResponseEntity<LocationResponseDTO> createLocation(@Valid @RequestBody LocationRequestDTO request) {
		LocationResponseDTO created = locationService.create(request);
		URI location = ServletUriComponentsBuilder.fromCurrentRequest()
				.path("/{id}")
				.buildAndExpand(created.id())
				.toUri();
		return ResponseEntity.status(HttpStatus.CREATED).location(location).body(created);
	}

	@PutMapping("/{id}")
	public ResponseEntity<LocationResponseDTO> updateLocation(@PathVariable Long id,
			@Valid @RequestBody LocationRequestDTO request) {
		return ResponseEntity.ok(locationService.update(id, request));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteLocation(@PathVariable Long id) {
		locationService.deleteById(id);
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/product/{productId}")
	public ResponseEntity<List<ProductLocationResponseDTO>> getProductLocations(@PathVariable Long productId) {
		return ResponseEntity.ok(locationService.getProductLocations(productId));
	}

	@PostMapping("/product/{productId}/stock")
	public ResponseEntity<Void> updateProductLocationStock(
			@PathVariable Long productId,
			@RequestParam Long locationId,
			@RequestParam BigDecimal stock) {
		locationService.updateProductLocationStock(productId, locationId, stock);
		return ResponseEntity.ok().build();
	}

	@PostMapping("/product/{productId}/transfer")
	public ResponseEntity<Void> transferStock(
			@PathVariable Long productId,
			@RequestParam Long fromLocationId,
			@RequestParam Long toLocationId,
			@RequestParam BigDecimal quantity) {
		locationService.transferStock(productId, fromLocationId, toLocationId, quantity);
		return ResponseEntity.ok().build();
	}

	@GetMapping("/{locationId}/products")
	public ResponseEntity<List<ProductLocationResponseDTO>> getProductsByLocation(@PathVariable Long locationId) {
		return ResponseEntity.ok(locationService.getProductsByLocation(locationId));
	}

	@DeleteMapping("/product/{productId}")
	public ResponseEntity<Void> removeProductLocation(
			@PathVariable Long productId,
			@RequestParam Long locationId) {
		locationService.removeProductLocation(productId, locationId);
		return ResponseEntity.noContent().build();
	}
}
