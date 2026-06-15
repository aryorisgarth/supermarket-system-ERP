package com.supermarket.user.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.supermarket.role.dto.RoleResponseDTO;

public record UserResponseDTO(
	Long id,
	String fullName,
	String email,
	Boolean isActive,
	RoleResponseDTO role,
	List<String> permissions,
	LocalDateTime lastLogin,
	LocalDateTime createdAt
) {
}
