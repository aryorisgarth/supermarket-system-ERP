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
		List<String> permissions = entity.getRole().getPermissions() == null
				? List.of()
				: entity.getRole().getPermissions().stream().map(permission -> permission.getCode()).sorted().toList();
		RoleResponseDTO roleResponse = new RoleResponseDTO(
			entity.getRole().getId(),
			entity.getRole().getName(),
			entity.getRole().getDescription(),
			permissions
		);
		
		return new UserResponseDTO(
			entity.getId(),
			entity.getFullName(),
			entity.getEmail(),
			entity.getIsActive(),
			roleResponse,
			permissions,
			entity.getLastLogin(),
			entity.getCreatedAt()
		);
	}

	public void apply(User entity, UserRequestDTO dto) {
		if (dto.getLastName() != null && !dto.getLastName().isBlank()) {
			entity.setFullName(dto.getFullName().trim() + " " + dto.getLastName().trim());
		} else {
			entity.setFullName(dto.getFullName() != null ? dto.getFullName().trim() : "");
		}
		entity.setEmail(dto.getEmail());
		entity.setPassword(dto.getPassword());
		entity.setIsActive(dto.getIsActive());
	}
}
