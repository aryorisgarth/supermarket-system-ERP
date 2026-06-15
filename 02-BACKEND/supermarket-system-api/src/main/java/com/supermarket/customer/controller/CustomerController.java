package com.supermarket.customer.controller;

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

import org.springframework.web.bind.annotation.PatchMapping;
import com.supermarket.customer.dto.CustomerRequestDTO;
import com.supermarket.customer.dto.CustomerResponseDTO;
import com.supermarket.customer.dto.CustomerDetailResponseDTO;
import com.supermarket.customer.service.CustomerService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;


@RestController
@RequestMapping("/api/customers")
@Validated
@RequiredArgsConstructor
@Tag(name = "Clientes", description = "Gestión de la base de datos de clientes")
public class CustomerController {


	private final CustomerService customerService;

	@GetMapping
	@Operation(summary = "Listar clientes", description = "Retorna una página de clientes")
	public ResponseEntity<Page<CustomerResponseDTO>> listCustomers(
			@RequestParam(required = false) String search,
			@PageableDefault(size = 20, sort = "fullName") Pageable pageable) {
		return ResponseEntity.ok(customerService.findAll(search, pageable));
	}

	@GetMapping("/search")
	public ResponseEntity<List<CustomerResponseDTO>> searchCustomers(@RequestParam String q) {
		return ResponseEntity.ok(customerService.searchCustomers(q));
	}

	@GetMapping("/{id}")
	public ResponseEntity<CustomerDetailResponseDTO> getCustomer(@PathVariable Long id) {
		return ResponseEntity.ok(customerService.findById(id));
	}

	@PostMapping
	public ResponseEntity<CustomerResponseDTO> createCustomer(@Valid @RequestBody CustomerRequestDTO request) {
		CustomerResponseDTO created = customerService.create(request);
		URI location = ServletUriComponentsBuilder.fromCurrentRequest()
				.path("/{id}")
				.buildAndExpand(created.id())
				.toUri();
		return ResponseEntity.status(HttpStatus.CREATED).location(location).body(created);
	}

	@PutMapping("/{id}")
	public ResponseEntity<CustomerResponseDTO> updateCustomer(@PathVariable Long id,
			@Valid @RequestBody CustomerRequestDTO request) {
		return ResponseEntity.ok(customerService.update(id, request));
	}

	@PatchMapping("/{id}/points")
	@Operation(summary = "Ajustar puntos de cliente", description = "Ajuste manual de puntos (solo Admin/Supervisor)")
	public ResponseEntity<CustomerResponseDTO> adjustPoints(@PathVariable Long id,
			@Valid @RequestBody PointsAdjustmentRequest request) {
		return ResponseEntity.ok(customerService.updatePoints(id, request.points()));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteCustomer(@PathVariable Long id) {
		customerService.deleteById(id);
		return ResponseEntity.noContent().build();
	}

	public record PointsAdjustmentRequest(@NotNull Integer points) {}
}
