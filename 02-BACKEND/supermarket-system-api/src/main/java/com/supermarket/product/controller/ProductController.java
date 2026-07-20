package com.supermarket.product.controller;

import java.math.BigDecimal;
import java.net.URI;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.supermarket.exception.ResourceNotFoundException;
import com.supermarket.product.dto.ProductRequestDTO;
import com.supermarket.product.dto.ProductResponseDTO;
import com.supermarket.product.dto.UpdateSalePriceRequestDTO;
import com.supermarket.product.service.ProductService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;


@Slf4j
@RestController
@RequestMapping("/api/products")
@Validated
@RequiredArgsConstructor
@Tag(name = "Productos", description = "Gestión del catálogo de productos e inventario")
public class ProductController {


	private final ProductService productService;

	@GetMapping
	@Operation(summary = "Listar productos", description = "Retorna una página de productos con filtros opcionales")
	public ResponseEntity<Page<ProductResponseDTO>> listProducts(
			@RequestParam(required = false) String q,
			@RequestParam(required = false) Short categoryId,
			@RequestParam(required = false) Integer supplierId,
			@RequestParam(required = false, defaultValue = "false") boolean lowStock,
			@PageableDefault(size = 20, sort = "name") Pageable pageable) {
		boolean hasFilters = (q != null && !q.isBlank()) || categoryId != null || supplierId != null || lowStock;
		if (hasFilters) {
			return ResponseEntity.ok(productService.findInventory(q, categoryId, supplierId, lowStock, pageable));
		}
		return ResponseEntity.ok(productService.findAll(pageable));
	}

	@GetMapping("/active")
	public ResponseEntity<List<ProductResponseDTO>> listActiveProducts() {
		return ResponseEntity.ok(productService.findActive());
	}

	@GetMapping("/low-stock")
	public ResponseEntity<List<ProductResponseDTO>> listLowStockProducts() {
		return ResponseEntity.ok(productService.findLowStock());
	}

	@GetMapping("/search")
	public ResponseEntity<List<ProductResponseDTO>> searchProducts(
			@RequestParam String q,
			@RequestParam(value = "source", defaultValue = "api") String source) {
		try {
			List<ProductResponseDTO> results = productService.searchProducts(q);
			if (results == null || results.isEmpty()) {
				logSearchNotFound(source, q);
				return ResponseEntity.ok(results != null ? results : List.of());
			}
			return ResponseEntity.ok(results);
		} catch (ResourceNotFoundException ex) {
			logSearchNotFound(source, q);
			throw ex;
		}
	}

	private void logSearchNotFound(String source, String query) {
		if ("balanza".equalsIgnoreCase(source)) {
			log.warn("[BALANZA] C\u00f3digo no encontrado: {}", query);
		} else {
			log.warn("[API-BUSQUEDA] T\u00e9rmino no encontrado: {}", query);
		}
	}

	@GetMapping("/barcode/{barcode}")
	public ResponseEntity<ProductResponseDTO> getProductByBarcode(@PathVariable String barcode) {
		return ResponseEntity.ok(productService.findByBarcode(barcode));
	}

	@GetMapping("/category/{categoryId}")
	public ResponseEntity<List<ProductResponseDTO>> getProductsByCategory(@PathVariable Short categoryId) {
		return ResponseEntity.ok(productService.findByCategory(categoryId));
	}

	@GetMapping("/supplier/{supplierId}")
	public ResponseEntity<List<ProductResponseDTO>> getProductsBySupplier(@PathVariable Integer supplierId) {
		return ResponseEntity.ok(productService.findBySupplier(supplierId));
	}

	@GetMapping("/{id}")
	public ResponseEntity<ProductResponseDTO> getProduct(@PathVariable Long id) {
		return ResponseEntity.ok(productService.findById(id));
	}

	@PostMapping
	public ResponseEntity<ProductResponseDTO> createProduct(@Valid @RequestBody ProductRequestDTO request) {
		ProductResponseDTO created = productService.create(request);
		URI location = ServletUriComponentsBuilder.fromCurrentRequest()
				.path("/{id}")
				.buildAndExpand(created.id())
				.toUri();
		return ResponseEntity.status(HttpStatus.CREATED).location(location).body(created);
	}

	@PutMapping("/{id}")
	public ResponseEntity<ProductResponseDTO> updateProduct(@PathVariable Long id,
			@Valid @RequestBody ProductRequestDTO request) {
		return ResponseEntity.ok(productService.update(id, request));
	}

	@PostMapping("/{id}/sale-price")
	public ResponseEntity<ProductResponseDTO> updateSalePrice(@PathVariable Long id,
			@Valid @RequestBody UpdateSalePriceRequestDTO request) {
		return ResponseEntity.ok(productService.updateSalePrice(id, request));
	}

	@PutMapping("/{id}/toggle-status")
	public ResponseEntity<Void> toggleProductStatus(@PathVariable Long id) {
		productService.toggleStatus(id);
		return ResponseEntity.ok().build();
	}

	@PutMapping("/{id}/stock")
	public ResponseEntity<Void> updateProductStock(@PathVariable Long id, @RequestParam BigDecimal quantity) {
		productService.updateStock(id, quantity);
		return ResponseEntity.ok().build();
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
		productService.deleteById(id);
		return ResponseEntity.noContent().build();
	}
}
