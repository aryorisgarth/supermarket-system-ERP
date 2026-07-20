package com.supermarket.security;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.convert.converter.Converter;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.supermarket.permission.repository.PermissionRepository;
import com.supermarket.role.entity.Role;
import com.supermarket.role.repository.RoleRepository;
import com.supermarket.user.entity.User;
import com.supermarket.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class KeycloakJwtAuthenticationConverter implements Converter<Jwt, AbstractAuthenticationToken> {

	private static final List<String> ROLE_PRIORITY = List.of(
			"ADMIN_INGENIERO",
			"ADMINISTRADOR",
			"SUPERVISOR",
			"BODEGUERO",
			"CAJERO",
			"CONSULTOR");

	private final UserRepository userRepository;
	private final RoleRepository roleRepository;
	private final PermissionRepository permissionRepository;

	@Value("${app.keycloak.client-id:supermarket-app}")
	private String clientId;

	@Override
	@Transactional
	public AbstractAuthenticationToken convert(Jwt jwt) {
		String email = Optional.ofNullable(jwt.getClaimAsString("email"))
				.orElse(jwt.getClaimAsString("preferred_username"));
		if (email == null || email.isBlank()) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Keycloak token does not contain email");
		}
		email = email.trim().toLowerCase(Locale.ROOT);

		userRepository.findByEmailWithRole(email).ifPresent(existing -> {
			if (!Boolean.TRUE.equals(existing.getIsActive())) {
				throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User account is inactive");
			}
		});

		String roleName = resolveRole(jwt);
		Role role = roleRepository.findByNameIgnoreCase(roleName)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN,
						"Role " + roleName + " does not exist in local database"));

		User user = userRepository.findByEmailWithRole(email)
				.map(existing -> updateUser(existing, jwt, role))
				.orElseGet(() -> createUser(email, jwt, role));

		Role effectiveRole = user.getRole() != null ? user.getRole() : role;
		List<SimpleGrantedAuthority> authorities = new ArrayList<>();
		authorities.add(new SimpleGrantedAuthority(RoleNames.toAuthority(effectiveRole.getName())));
		permissionCodesFor(user, effectiveRole).stream()
				.map(SimpleGrantedAuthority::new)
				.forEach(authorities::add);

		LoggedUser principal = new LoggedUser(user.getId(), user.getEmail(), "KEYCLOAK_MANAGED_USER", true, authorities);
		return new UsernamePasswordAuthenticationToken(principal, jwt.getTokenValue(), authorities);
	}

	private User createUser(String email, Jwt jwt, Role role) {
		User user = new User();
		user.setEmail(email.toLowerCase(Locale.ROOT));
		user.setFullName(resolveFullName(jwt, email));
		user.setPassword("KEYCLOAK_MANAGED_USER");
		user.setIsActive(true);
		user.setRole(role);
		user.setCreatedAt(LocalDateTime.now());
		user.setLastLogin(LocalDateTime.now());
		return userRepository.save(user);
	}

	private User updateUser(User user, Jwt jwt, Role keycloakRole) {
		if (!Boolean.TRUE.equals(user.getIsActive())) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User account is inactive");
		}
		user.setFullName(resolveFullName(jwt, user.getEmail()));
		// Conservar rol local; solo subir privilegio si Keycloak trae uno mayor
		user.setRole(preferLocalOrUpgrade(user.getRole(), keycloakRole));
		user.setLastLogin(LocalDateTime.now());
		return userRepository.save(user);
	}

	private Role preferLocalOrUpgrade(Role localRole, Role keycloakRole) {
		if (localRole == null) {
			return keycloakRole;
		}
		int localIdx = rolePriorityIndex(localRole.getName());
		int keycloakIdx = rolePriorityIndex(keycloakRole.getName());
		if (keycloakIdx >= 0 && (localIdx < 0 || keycloakIdx < localIdx)) {
			return keycloakRole;
		}
		return localRole;
	}

	private int rolePriorityIndex(String roleName) {
		if (roleName == null || roleName.isBlank()) {
			return -1;
		}
		return ROLE_PRIORITY.indexOf(roleName.trim().toUpperCase(Locale.ROOT));
	}

	private String resolveFullName(Jwt jwt, String fallback) {
		String name = jwt.getClaimAsString("name");
		if (name != null && !name.isBlank()) {
			return name;
		}
		String givenName = jwt.getClaimAsString("given_name");
		String familyName = jwt.getClaimAsString("family_name");
		String combined = String.join(" ",
				givenName != null ? givenName : "",
				familyName != null ? familyName : "").trim();
		return combined.isBlank() ? fallback : combined;
	}

	private String resolveRole(Jwt jwt) {
		List<String> roles = new ArrayList<>();
		Map<String, Object> realmAccess = jwt.getClaimAsMap("realm_access");
		addRoles(roles, realmAccess);

		Map<String, Object> resourceAccess = jwt.getClaimAsMap("resource_access");
		if (resourceAccess != null && resourceAccess.get(clientId) instanceof Map<?, ?> clientAccess) {
			addRoles(roles, clientAccess);
		}

		return ROLE_PRIORITY.stream()
				.filter(roles::contains)
				.findFirst()
				.orElse("CONSULTOR");
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
		if ("ADMINISTRADOR_INGENIERO".equals(normalized)
				|| "ADMININGENIERO".equals(normalized)
				|| (normalized.contains("ADMIN") && normalized.contains("INGEN"))) {
			return "ADMIN_INGENIERO";
		}
		return normalized;
	}

	private List<String> permissionCodesFor(User user, Role role) {
		if ("ADMIN_INGENIERO".equalsIgnoreCase(role.getName())) {
			return permissionRepository.findAll().stream()
					.map(permission -> permission.getCode())
					.toList();
		}
		Set<String> codes = new LinkedHashSet<>(permissionRepository.findCodesByRoleId(role.getId()));
		if (user.getDirectPermissions() != null) {
			user.getDirectPermissions().stream()
					.map(permission -> permission.getCode())
					.forEach(codes::add);
		}
		return List.copyOf(codes);
	}
}
