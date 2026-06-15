package com.supermarket.role.service;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.supermarket.audit.service.AuditLogService;
import com.supermarket.permission.entity.Permission;
import com.supermarket.permission.repository.PermissionRepository;
import com.supermarket.role.dto.RoleRequestDTO;
import com.supermarket.role.dto.RoleResponseDTO;
import com.supermarket.role.entity.Role;
import com.supermarket.role.mapper.RoleMapper;
import com.supermarket.role.repository.RoleRepository;
import com.supermarket.security.SecurityUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RoleServiceImpl implements RoleService {

	private final RoleRepository roleRepository;
	private final RoleMapper roleMapper;
	private final PermissionRepository permissionRepository;
	private final AuditLogService auditLogService;

	@Override
	public List<RoleResponseDTO> findAll() {
		return roleRepository.findAllByOrderByNameAsc().stream()
				.map(roleMapper::toResponse)
				.toList();
	}

	@Override
	public RoleResponseDTO findById(Byte id) {
		Role role = roleRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Role not found"));
		return roleMapper.toResponse(role);
	}

	@Override
	@Transactional
	public RoleResponseDTO create(RoleRequestDTO request) {
		normalize(request);
		String name = request.getName();
		if (roleRepository.existsByNameIgnoreCase(name)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Role name already exists");
		}
		Role role = roleMapper.toEntity(request);
		applyPermissions(role, request.getPermissions());
		Role saved = roleRepository.save(role);
		return roleMapper.toResponse(saved);
	}

	@Override
	@Transactional
	public RoleResponseDTO update(Byte id, RoleRequestDTO request) {
		normalize(request);
		Role role = roleRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Role not found"));
		String name = request.getName();
		if (roleRepository.existsByNameIgnoreCaseAndIdNot(name, id)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Role name already exists");
		}
		Set<String> oldPermissions = permissionCodes(role);
		roleMapper.apply(role, request);
		applyPermissions(role, request.getPermissions());
		Role saved = roleRepository.save(role);
		Set<String> newPermissions = permissionCodes(saved);
		if (!oldPermissions.equals(newPermissions)) {
			auditLogService.record(SecurityUtils.currentUserId(), "ROLE_PERMISSIONS_UPDATE", "roles", (long) saved.getId(),
					Map.of("role", saved.getName(), "permissions", oldPermissions),
					Map.of("role", saved.getName(), "permissions", newPermissions));
		}
		return roleMapper.toResponse(saved);
	}

	@Override
	@Transactional
	public void deleteById(Byte id) {
		if (!roleRepository.existsById(id)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Role not found");
		}
		if (roleRepository.countUsersByRoleId(id) > 0) {
			throw new ResponseStatusException(HttpStatus.CONFLICT,
					"Role cannot be deleted because it is assigned to one or more users");
		}
		try {
			roleRepository.deleteById(id);
		} catch (DataIntegrityViolationException ex) {
			throw new ResponseStatusException(HttpStatus.CONFLICT,
					"Role cannot be deleted due to related data in the database", ex);
		}
	}

	private static void normalize(RoleRequestDTO request) {
		request.setName(request.getName().trim());
		if (request.getDescription() != null) {
			String d = request.getDescription().trim();
			request.setDescription(d.isEmpty() ? null : d);
		}
	}

	private void applyPermissions(Role role, List<String> permissionCodes) {
		if (permissionCodes == null) {
			return;
		}
		List<String> normalizedCodes = permissionCodes.stream()
				.filter(code -> code != null && !code.isBlank())
				.map(String::trim)
				.distinct()
				.toList();
		List<Permission> permissions = permissionRepository.findByCodeIn(normalizedCodes);
		if (permissions.size() != normalizedCodes.size()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "One or more permissions do not exist");
		}
		role.setPermissions(new HashSet<>(permissions));
	}

	private Set<String> permissionCodes(Role role) {
		if (role.getPermissions() == null) {
			return Set.of();
		}
		return role.getPermissions().stream()
				.map(Permission::getCode)
				.collect(java.util.stream.Collectors.toCollection(java.util.TreeSet::new));
	}
}
