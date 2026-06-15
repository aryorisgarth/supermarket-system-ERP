package com.supermarket.user.controller;

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

import com.supermarket.user.dto.UserRequestDTO;
import com.supermarket.user.dto.UserResponseDTO;
import com.supermarket.user.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@Validated
@RequiredArgsConstructor
public class UserController {

	private final UserService userService;

	@GetMapping
	public ResponseEntity<Page<UserResponseDTO>> listUsers(
			@RequestParam(required = false) String q,
			@PageableDefault(size = 20, sort = "fullName") Pageable pageable) {
		return ResponseEntity.ok(userService.findPage(q, pageable));
	}

	@GetMapping("/active")
	public ResponseEntity<List<UserResponseDTO>> listActiveUsers() {
		return ResponseEntity.ok(userService.findActive());
	}

	@GetMapping("/search")
	public ResponseEntity<List<UserResponseDTO>> searchUsers(@RequestParam String q) {
		return ResponseEntity.ok(userService.searchUsers(q));
	}

	@GetMapping("/role/{roleName}")
	public ResponseEntity<List<UserResponseDTO>> getUsersByRole(@PathVariable String roleName) {
		return ResponseEntity.ok(userService.findByRole(roleName));
	}

	@GetMapping("/{id}")
	public ResponseEntity<UserResponseDTO> getUser(@PathVariable Long id) {
		return ResponseEntity.ok(userService.findById(id));
	}

	@PostMapping
	public ResponseEntity<UserResponseDTO> createUser(@Valid @RequestBody UserRequestDTO request) {
		UserResponseDTO created = userService.create(request);
		URI location = ServletUriComponentsBuilder.fromCurrentRequest()
				.path("/{id}")
				.buildAndExpand(created.id())
				.toUri();
		return ResponseEntity.status(HttpStatus.CREATED).location(location).body(created);
	}

	@PutMapping("/{id}")
	public ResponseEntity<UserResponseDTO> updateUser(@PathVariable Long id,
			@Valid @RequestBody UserRequestDTO request) {
		return ResponseEntity.ok(userService.update(id, request));
	}

	@PutMapping("/{id}/toggle-status")
	public ResponseEntity<Void> toggleUserStatus(@PathVariable Long id) {
		userService.toggleStatus(id);
		return ResponseEntity.ok().build();
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
		userService.deleteById(id);
		return ResponseEntity.noContent().build();
	}
}
