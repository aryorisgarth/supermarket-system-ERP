package com.supermarket.role.mapper;

import java.util.Comparator;

import org.springframework.stereotype.Component;

import com.supermarket.role.dto.RoleRequestDTO;
import com.supermarket.role.dto.RoleResponseDTO;
import com.supermarket.role.entity.Role;

@Component
public class RoleMapper {

	public Role toEntity(RoleRequestDTO dto) {
		Role role = new Role();
		apply(role, dto);
		return role;
	}

	public RoleResponseDTO toResponse(Role entity) {
		var permissions = entity.getPermissions() == null
				? java.util.List.<String>of()
				: entity.getPermissions().stream()
						.map(permission -> permission.getCode())
						.sorted(Comparator.naturalOrder())
						.toList();
		return new RoleResponseDTO(entity.getId(), entity.getName(), entity.getDescription(), permissions);
	}

	public void apply(Role entity, RoleRequestDTO dto) {
		entity.setName(dto.getName());
		entity.setDescription(dto.getDescription());
	}
}
