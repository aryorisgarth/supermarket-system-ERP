package com.supermarket.user.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.supermarket.role.entity.Role;
import com.supermarket.role.repository.RoleRepository;
import com.supermarket.permission.entity.Permission;
import com.supermarket.permission.repository.PermissionRepository;
import com.supermarket.security.SecurityUtils;
import com.supermarket.user.dto.UserRequestDTO;
import com.supermarket.user.dto.UserResponseDTO;
import com.supermarket.user.entity.User;
import com.supermarket.user.mapper.UserMapper;
import com.supermarket.user.repository.UserRepository;
import com.supermarket.user.util.PasswordGenerator;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService {

	private final UserRepository userRepository;
	private final RoleRepository roleRepository;
	private final UserMapper userMapper;
	private final PasswordEncoder passwordEncoder;
	private final KeycloakAdminService keycloakAdminService;
	private final EmailService emailService;
	private final PermissionRepository permissionRepository;
	private final UserArchiveService userArchiveService;

	@Override
	public List<UserResponseDTO> findAll() {
		return userRepository.findAllByIsSystemFalseOrderByFullNameAsc().stream()
				.map(userMapper::toResponse)
				.toList();
	}

	@Override
	public Page<UserResponseDTO> findPage(String search, Pageable pageable) {
		String normalized = (search != null && !search.isBlank()) ? search.trim() : null;
		return userRepository.searchPage(normalized, pageable).map(userMapper::toResponse);
	}

	@Override
	public List<UserResponseDTO> findActive() {
		return userRepository.findByIsActiveTrueOrderByFullNameAsc().stream()
				.map(userMapper::toResponse)
				.toList();
	}

	@Override
	public UserResponseDTO findById(Long id) {
		User user = userRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
		return userMapper.toResponse(user);
	}

	@Override
	public List<UserResponseDTO> findByRole(String roleName) {
		return userRepository.findByRole_NameOrderByFullNameAsc(roleName).stream()
				.map(userMapper::toResponse)
				.toList();
	}

	@Override
	public List<UserResponseDTO> searchUsers(String search) {
		return userRepository.searchUsers(search).stream()
				.map(userMapper::toResponse)
				.toList();
	}

	@Override
	@Transactional
	public UserResponseDTO create(UserRequestDTO request) {
		normalize(request);
		String email = request.getEmail();
		
		if (userRepository.existsByEmail(email)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "El correo ya existe en el sistema");
		}

		Role role = roleRepository.findByNameIgnoreCase(request.getRoleName())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role not found: " + request.getRoleName()));

		String tempPassword = PasswordGenerator.generate(12);

		String keycloakId;
		try {
			keycloakId = keycloakAdminService.createUser(email, request.getFullName(), request.getLastName(), tempPassword);
		} catch (ResponseStatusException e) {
			// Reintento tras fallo previo: usuario huérfano en Keycloak sin fila local
			if (e.getStatusCode() == HttpStatus.CONFLICT) {
				keycloakId = keycloakAdminService.findUserIdByEmail(email)
						.orElseThrow(() -> e);
				keycloakAdminService.resetPassword(keycloakId, tempPassword, true);
				log.warn("Usuario {} ya existía en Keycloak; se reutilizó y se reinició la contraseña temporal", email);
			} else {
				throw e;
			}
		}
		keycloakAdminService.assignRole(keycloakId, role.getName(), role.getDescription());

		User user = userMapper.toEntity(request);
		user.setPassword(passwordEncoder.encode("KEYCLOAK_MANAGED_USER"));
		user.setRole(role);
		replaceDirectPermissions(user, resolveDirectPermissions(request.getDirectPermissions(), role));
		user.setCreatedAt(LocalDateTime.now());
		
		User saved = userRepository.save(user);

		boolean emailSent = emailService.sendTemporaryPasswordEmail(email, request.getFullName(), tempPassword);
		// Si el correo falla, devolvemos la clave temporal al admin para que la entregue manualmente
		return userMapper.toResponse(saved, emailSent, emailSent ? null : tempPassword);
	}

	@Override
	@Transactional
	public UserResponseDTO update(Long id, UserRequestDTO request) {
		normalize(request);
		User user = userRepository.findByIdWithRoleAndPermissions(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

		String email = request.getEmail();
		if (!user.getEmail().equals(email) && userRepository.existsByEmailAndIdNot(email, id)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
		}

		Role role = roleRepository.findByNameIgnoreCase(request.getRoleName())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role not found: " + request.getRoleName()));

		userMapper.apply(user, request);
		if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
			user.setPassword(passwordEncoder.encode(request.getPassword()));
		}

		if (!user.getRole().getName().equalsIgnoreCase(role.getName())) {
			java.util.Optional<String> kcUserId = keycloakAdminService.findUserIdByEmail(user.getEmail());
			if (kcUserId.isPresent()) {
				keycloakAdminService.updateUserRole(kcUserId.get(), role.getName(), role.getDescription());
			}
		}

		user.setRole(role);
		replaceDirectPermissions(user, resolveDirectPermissions(request.getDirectPermissions(), role));

		User saved = userRepository.save(user);
		return userMapper.toResponse(saved);
	}

	@Override
	@Transactional
	public void deleteById(Long id) {
		User user = userRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

		if (userArchiveService.isSystemUser(user)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
					"No se puede eliminar el usuario técnico del sistema.");
		}

		Long currentUserId = SecurityUtils.currentUserId();
		if (currentUserId != null && currentUserId.equals(id)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
					"No puede eliminar su propio usuario mientras tiene sesión activa.");
		}

		User archiveUser = userArchiveService.ensureArchiveUser();
		userArchiveService.transferOperationalReferences(id, archiveUser.getId());

		String email = user.getEmail();

		try {
			userRepository.delete(user);
		} catch (DataIntegrityViolationException ex) {
			throw new ResponseStatusException(HttpStatus.CONFLICT,
					"No se pudo eliminar el usuario porque aún tiene datos vinculados no transferibles.",
					ex);
		}

		// Tras commit local, borrar también en Keycloak (evita desync por rollback)
		org.springframework.transaction.support.TransactionSynchronizationManager.registerSynchronization(
				new org.springframework.transaction.support.TransactionSynchronization() {
					@Override
					public void afterCommit() {
						try {
							keycloakAdminService.findUserIdByEmail(email)
									.ifPresent(keycloakAdminService::deleteUser);
						} catch (Exception e) {
							log.error("Usuario {} borrado en BD, pero falló borrarlo en Keycloak: {}",
									email, e.getMessage());
						}
					}
				});
	}

	@Override
	@Transactional
	public void toggleStatus(Long id) {
		User user = userRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
		
		boolean newStatus = !user.getIsActive();
		user.setIsActive(newStatus);
		userRepository.save(user);
		try {
			java.util.Optional<String> kcUserId = keycloakAdminService.findUserIdByEmail(user.getEmail());
			if (kcUserId.isPresent()) {
				keycloakAdminService.updateUserEnabled(kcUserId.get(), newStatus);
			} else {
				log.warn("Keycloak user not found for email {} while toggling status to {}", user.getEmail(), newStatus);
			}
		} catch (RuntimeException ex) {
			log.warn("Keycloak sync failed for user {} while toggling status to {}. Local status updated anyway.",
					user.getEmail(), newStatus, ex);
		}
	}

	private static void normalize(UserRequestDTO request) {
		request.setFullName(request.getFullName().trim());
		if (request.getLastName() != null) {
			request.setLastName(request.getLastName().trim());
		}
		request.setEmail(request.getEmail().trim().toLowerCase());
		request.setRoleName(request.getRoleName().trim());
	}

	private Set<Permission> resolveDirectPermissions(List<String> directPermissionCodes, Role role) {
		List<String> codes = directPermissionCodes == null
				? List.of()
				: directPermissionCodes.stream()
						.filter(code -> code != null && !code.isBlank())
						.map(String::trim)
						.distinct()
						.toList();
		if (codes.isEmpty()) {
			return new java.util.HashSet<>();
		}
		Set<String> inheritedCodes = new java.util.HashSet<>(permissionRepository.findCodesByRoleId(role.getId()));
		return permissionRepository.findByCodeIn(codes).stream()
				.filter(permission -> !inheritedCodes.contains(permission.getCode()))
				.collect(java.util.stream.Collectors.toCollection(java.util.HashSet::new));
	}

	/** Mutar la colección gestionada evita perder filas en user_permissions al reemplazar un bag lazy. */
	private void replaceDirectPermissions(User user, Set<Permission> next) {
		if (user.getDirectPermissions() == null) {
			user.setDirectPermissions(new java.util.HashSet<>());
		}
		user.getDirectPermissions().clear();
		user.getDirectPermissions().addAll(next);
	}
}
