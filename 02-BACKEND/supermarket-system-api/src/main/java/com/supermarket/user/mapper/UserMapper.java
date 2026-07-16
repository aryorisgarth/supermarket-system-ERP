package com.supermarket.user.mapper;

import java.util.List;

import org.springframework.stereotype.Component;

import com.supermarket.role.dto.RoleResponseDTO;
import com.supermarket.user.dto.UserRequestDTO;
import com.supermarket.user.dto.UserResponseDTO;
import com.supermarket.user.entity.User;

@Component
public class UserMapper {

	public User toEntity(UserRequestDTO dto) {
		User user = new User();
		apply(user, dto);
		return user;
	}

	public UserResponseDTO toResponse(User entity) {
		List<String> rolePermissions = entity.getRole().getPermissions() == null
				? List.of()
				: entity.getRole().getPermissions().stream().map(permission -> permission.getCode()).sorted().toList();
		List<String> directPermissions = entity.getDirectPermissions() == null
				? List.of()
				: entity.getDirectPermissions().stream().map(permission -> permission.getCode()).sorted().toList();
		List<String> permissions = java.util.stream.Stream.concat(rolePermissions.stream(), directPermissions.stream())
				.distinct()
				.sorted()
				.toList();
		RoleResponseDTO roleResponse = new RoleResponseDTO(
			entity.getRole().getId(),
			entity.getRole().getName(),
			entity.getRole().getDescription(),
			rolePermissions
		);
		
		return new UserResponseDTO(
			entity.getId(),
			entity.getFullName(),
			entity.getEmail(),
			entity.getIsActive(),
			roleResponse,
			permissions,
			directPermissions,
			entity.getLastLogin(),
			entity.getCreatedAt(),
			null,
			null
		);
	}

	public UserResponseDTO toResponse(User entity, boolean welcomeEmailSent, String temporaryPassword) {
		UserResponseDTO base = toResponse(entity);
		return new UserResponseDTO(
			base.id(),
			base.fullName(),
			base.email(),
			base.isActive(),
			base.role(),
			base.permissions(),
			base.directPermissions(),
			base.lastLogin(),
			base.createdAt(),
			welcomeEmailSent,
			temporaryPassword
		);
	}

	public void apply(User entity, UserRequestDTO dto) {
		if (dto.getLastName() != null && !dto.getLastName().isBlank()) {
			entity.setFullName(dto.getFullName().trim() + " " + dto.getLastName().trim());
		} else {
			entity.setFullName(dto.getFullName() != null ? dto.getFullName().trim() : "");
		}
		entity.setEmail(dto.getEmail());
		entity.setIsActive(dto.getIsActive());
	}
}
