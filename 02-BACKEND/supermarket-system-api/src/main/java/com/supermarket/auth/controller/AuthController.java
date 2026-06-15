package com.supermarket.auth.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.supermarket.auth.dto.ChangePasswordRequestDTO;
import com.supermarket.auth.dto.LoginRequestDTO;
import com.supermarket.auth.dto.LoginResponseDTO;
import com.supermarket.auth.dto.RefreshTokenRequestDTO;
import com.supermarket.auth.dto.ForgotPasswordRequestDTO;
import com.supermarket.auth.service.AuthService;
import com.supermarket.permission.repository.PermissionRepository;
import com.supermarket.security.LoggedUser;
import com.supermarket.user.repository.UserRepository;
import com.supermarket.role.repository.RoleRepository;
import com.supermarket.user.entity.User;
import com.supermarket.role.entity.Role;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.Optional;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;
import java.util.Locale;

@RestController
@RequestMapping("/api/auth")
@Validated
@RequiredArgsConstructor
@Tag(name = "Autenticación", description = "Endpoint de login para obtener el token JWT")
public class AuthController {

	private final AuthService authService;
	private final UserRepository userRepository;
	private final RoleRepository roleRepository;
	private final PermissionRepository permissionRepository;

	@Value("${app.keycloak.client-id:supermarket-app}")
	private String clientId;

	@PostMapping("/login")
	@Operation(summary = "Iniciar sesión", description = "Retorna un token JWT válido y refresh token. Úsalo en el botón 'Authorize' de Swagger.")
	public ResponseEntity<LoginResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
		return ResponseEntity.ok(authService.login(request));
	}

	@PostMapping("/refresh")
	@Operation(summary = "Refrescar token", description = "Obtiene un nuevo access token usando el refresh token")
	public ResponseEntity<LoginResponseDTO> refreshToken(@Valid @RequestBody RefreshTokenRequestDTO request) {
		return ResponseEntity.ok(authService.refreshToken(request.refreshToken()));
	}

	@PostMapping("/forgot-password")
	@Operation(summary = "Recuperar contraseña", description = "Envía un correo para restablecer la contraseña al email especificado")
	public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequestDTO request) {
		authService.forgotPassword(request.email());
		return ResponseEntity.ok(Map.of("message", "Si el correo electrónico está registrado, recibirás un enlace de recuperación"));
	}

	@PostMapping("/logout")
	@Operation(summary = "Cerrar sesión", description = "Invalida el refresh token del usuario")
	public ResponseEntity<Void> logout(@AuthenticationPrincipal LoggedUser loggedUser) {
		authService.logout(loggedUser.getId());
		return ResponseEntity.noContent().build();
	}

	@PostMapping("/change-password")
	@Operation(summary = "Cambiar contraseña", description = "Actualiza la contraseña del usuario autenticado en la base de datos local")
	public ResponseEntity<Map<String, String>> changePassword(
			@Valid @RequestBody ChangePasswordRequestDTO request,
			Authentication authentication) {
		String email = resolveEmail(authentication);
		if (email == null || email.isBlank()) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "No autenticado"));
		}
		authService.changePassword(email, request.currentPassword(), request.newPassword());
		return ResponseEntity.ok(Map.of("message", "Contraseña actualizada correctamente"));
	}

	@GetMapping("/me")
	@Operation(summary = "Obtener usuario autenticado y sus permisos", description = "Devuelve los datos y permisos reales del usuario autenticado (local o Keycloak)")
	public ResponseEntity<?> getCurrentUser(Authentication authentication) {
		if (authentication == null || !authentication.isAuthenticated()) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("No autenticado");
		}

		String email = null;
		String fullName = null;
		String username = null;
		String roleName = null;

		if (authentication.getPrincipal() instanceof LoggedUser loggedUser) {
			email = loggedUser.getEmail();
			username = loggedUser.getUsername();
			Optional<User> userOpt = userRepository.findByEmailWithRole(email);
			if (userOpt.isPresent()) {
				User user = userOpt.get();
				fullName = user.getFullName();
				roleName = user.getRole().getName();
			} else {
				fullName = "Usuario Local";
				roleName = "CONSULTOR";
			}
		} else if (authentication.getPrincipal() instanceof Jwt jwt) {
			email = jwt.getClaimAsString("email");
			if (email == null) {
				email = jwt.getClaimAsString("preferred_username");
			}
			username = jwt.getClaimAsString("preferred_username");
			fullName = jwt.getClaimAsString("name");
			if (fullName == null) {
				fullName = jwt.getClaimAsString("given_name");
			}

			roleName = resolveRole(jwt);
			if (roleName == null) {
				roleName = "CONSULTOR";
			}
		} else {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Tipo de autenticación no soportado");
		}

		Optional<Role> roleOpt = roleRepository.findByNameIgnoreCase(roleName);
		List<String> permissions = new ArrayList<>();
		if (roleOpt.isPresent()) {
			Role role = roleOpt.get();
			if ("ADMIN_INGENIERO".equalsIgnoreCase(role.getName())) {
				permissionRepository.findAll().forEach(permission -> permissions.add(permission.getCode()));
			} else {
				permissions.addAll(permissionRepository.findCodesByRoleId(role.getId()));
			}
		}

		Map<String, Object> response = new HashMap<>();
		response.put("fullName", fullName != null ? fullName : "Usuario Keycloak");
		response.put("username", username != null ? username : email);
		response.put("email", email);

		Map<String, String> roleMap = new HashMap<>();
		roleMap.put("name", roleName);
		response.put("role", roleMap);

		response.put("permissions", permissions);

		return ResponseEntity.ok(response);
	}

	private String resolveRole(Jwt jwt) {
		List<String> roles = new ArrayList<>();
		addRoles(roles, jwt.getClaimAsMap("realm_access"));

		Map<String, Object> resourceAccess = jwt.getClaimAsMap("resource_access");
		if (resourceAccess != null && resourceAccess.get(clientId) instanceof Map<?, ?> clientAccess) {
			addRoles(roles, clientAccess);
		}

		return List.of("ADMIN_INGENIERO", "ADMINISTRADOR", "SUPERVISOR", "CAJERO", "CONSULTOR").stream()
				.filter(roles::contains)
				.findFirst()
				.orElse(null);
	}

	private void addRoles(List<String> roles, Map<?, ?> access) {
		if (access == null || !(access.get("roles") instanceof List<?> rawRoles)) {
			return;
		}
		rawRoles.stream()
				.filter(String.class::isInstance)
				.map(String.class::cast)
				.map(this::normalizeRole)
				.forEach(roles::add);
	}

	private String normalizeRole(String role) {
		String normalized = role.trim()
				.replaceFirst("(?i)^ROLE_", "")
				.replaceAll("\\s+", "_")
				.replace('-', '_')
				.toUpperCase(Locale.ROOT);
		if ("ADMINISTRADOR_INGENIERO".equals(normalized) || "ADMININGENIERO".equals(normalized)) {
			return "ADMIN_INGENIERO";
		}
		return normalized;
	}

	private String resolveEmail(Authentication authentication) {
		if (authentication == null || !authentication.isAuthenticated()) {
			return null;
		}
		if (authentication.getPrincipal() instanceof LoggedUser loggedUser) {
			return loggedUser.getEmail();
		}
		if (authentication.getPrincipal() instanceof Jwt jwt) {
			String email = jwt.getClaimAsString("email");
			return email != null ? email : jwt.getClaimAsString("preferred_username");
		}
		return null;
	}
}
