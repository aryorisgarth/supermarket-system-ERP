package com.supermarket.category.controller;

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

import com.supermarket.category.dto.CategoryRequestDTO;
import com.supermarket.category.dto.CategoryResponseDTO;
import com.supermarket.category.service.CategoryService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/categories")
@Validated
@RequiredArgsConstructor
public class CategoryController {

	private final CategoryService categoryService;

	@GetMapping
	public ResponseEntity<Page<CategoryResponseDTO>> listCategories(
			@RequestParam(required = false) String q,
			@PageableDefault(size = 20, sort = "name") Pageable pageable) {
		return ResponseEntity.ok(categoryService.findPage(q, pageable));
	}

	@GetMapping("/search")
	public ResponseEntity<List<CategoryResponseDTO>> searchCategories(@RequestParam String q) {
		return ResponseEntity.ok(categoryService.searchCategories(q));
	}

	@GetMapping("/{id}")
	public ResponseEntity<CategoryResponseDTO> getCategory(@PathVariable Short id) {
		return ResponseEntity.ok(categoryService.findById(id));
	}

	@PostMapping
	public ResponseEntity<CategoryResponseDTO> createCategory(@Valid @RequestBody CategoryRequestDTO request) {
		CategoryResponseDTO created = categoryService.create(request);
		URI location = ServletUriComponentsBuilder.fromCurrentRequest()
				.path("/{id}")
				.buildAndExpand(created.id())
				.toUri();
		return ResponseEntity.status(HttpStatus.CREATED).location(location).body(created);
	}

	@PutMapping("/{id}")
	public ResponseEntity<CategoryResponseDTO> updateCategory(@PathVariable Short id,
			@Valid @RequestBody CategoryRequestDTO request) {
		return ResponseEntity.ok(categoryService.update(id, request));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteCategory(@PathVariable Short id) {
		categoryService.deleteById(id);
		return ResponseEntity.noContent().build();
	}
}
