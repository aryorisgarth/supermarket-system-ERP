package com.supermarket.role.controller;

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
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.supermarket.role.dto.RoleRequestDTO;
import com.supermarket.role.dto.RoleResponseDTO;
import com.supermarket.role.service.RoleService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/roles")
@Validated
@RequiredArgsConstructor
public class RoleController {

	private final RoleService roleService;

	@GetMapping
	public ResponseEntity<List<RoleResponseDTO>> listRoles() {
		return ResponseEntity.ok(roleService.findAll());
	}

	@GetMapping("/{id}")
	public ResponseEntity<RoleResponseDTO> getRole(@PathVariable Byte id) {
		return ResponseEntity.ok(roleService.findById(id));
	}

	@PostMapping
	public ResponseEntity<RoleResponseDTO> createRole(@Valid @RequestBody RoleRequestDTO request) {
		RoleResponseDTO created = roleService.create(request);
		URI location = ServletUriComponentsBuilder.fromCurrentRequest()
				.path("/{id}")
				.buildAndExpand(created.id())
				.toUri();
		return ResponseEntity.status(HttpStatus.CREATED).location(location).body(created);
	}

	@PutMapping("/{id}")
	public ResponseEntity<RoleResponseDTO> updateRole(@PathVariable Byte id,
			@Valid @RequestBody RoleRequestDTO request) {
		return ResponseEntity.ok(roleService.update(id, request));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteRole(@PathVariable Byte id) {
		roleService.deleteById(id);
		return ResponseEntity.noContent().build();
	}
}
