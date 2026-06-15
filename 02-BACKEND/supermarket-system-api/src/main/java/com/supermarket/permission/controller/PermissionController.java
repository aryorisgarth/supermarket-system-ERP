package com.supermarket.permission.controller;

import java.util.Comparator;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.supermarket.permission.dto.PermissionResponseDTO;
import com.supermarket.permission.repository.PermissionRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/permissions")
@RequiredArgsConstructor
public class PermissionController {

	private final PermissionRepository permissionRepository;

	@GetMapping
	public ResponseEntity<List<PermissionResponseDTO>> list() {
		List<PermissionResponseDTO> permissions = permissionRepository.findAll().stream()
				.sorted(Comparator.comparing(permission -> permission.getCode()))
				.map(permission -> new PermissionResponseDTO(
						permission.getId(),
						permission.getCode(),
						permission.getDescription()))
				.toList();
		return ResponseEntity.ok(permissions);
	}
}
