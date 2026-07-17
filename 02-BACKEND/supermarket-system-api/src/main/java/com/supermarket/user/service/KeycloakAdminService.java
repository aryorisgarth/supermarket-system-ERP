package com.supermarket.user.service;

import java.net.URI;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

@Service
public class KeycloakAdminService {

	private final RestClient restClient;

	@Value("${app.keycloak.admin.server-url}")
	private String serverUrl;

	@Value("${app.keycloak.admin.realm}")
	private String realm;

	@Value("${app.keycloak.admin.client-id}")
	private String clientId;

	@Value("${app.keycloak.admin.client-secret}")
	private String clientSecret;

	public KeycloakAdminService() {
		this.restClient = RestClient.builder().build();
	}

	private String adminBase() {
		return serverUrl + "/admin/realms/" + realm;
	}

	public String getAccessToken() {
		MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
		formData.add("grant_type", "client_credentials");
		formData.add("client_id", clientId);
		formData.add("client_secret", clientSecret);

		try {
			Map<String, Object> response = restClient.post()
					.uri(serverUrl + "/realms/" + realm + "/protocol/openid-connect/token")
					.contentType(MediaType.APPLICATION_FORM_URLENCODED)
					.body(formData)
					.retrieve()
					.body(Map.class);

			if (response == null || !response.containsKey("access_token")) {
				throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Keycloak authorization response is invalid");
			}

			return (String) response.get("access_token");
		} catch (HttpClientErrorException e) {
			String body = e.getResponseBodyAsString();
			if (body != null && body.contains("unauthorized_client")) {
				throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
						"Credenciales invalidas del client admin de Keycloak (supermarket-admin-client). "
								+ "Verifica KEYCLOAK_ADMIN_CLIENT_SECRET en .env.prod y ejecuta: bash scripts/keycloak-bootstrap.sh");
			}
			throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to authenticate with Keycloak: " + body, e);
		}
	}

	public String createUser(String email, String firstName, String lastName, String tempPassword) {
		String token = getAccessToken();

		Map<String, Object> credentials = new java.util.LinkedHashMap<>();
		credentials.put("type", "password");
		credentials.put("value", tempPassword);
		credentials.put("temporary", true);

		Map<String, Object> userBody = new java.util.LinkedHashMap<>();
		userBody.put("username", email);
		userBody.put("email", email);
		userBody.put("enabled", true);
		userBody.put("emailVerified", true);
		userBody.put("firstName", firstName != null ? firstName : "");
		userBody.put("lastName", lastName != null ? lastName : "");
		userBody.put("credentials", List.of(credentials));
		userBody.put("requiredActions", List.of("UPDATE_PASSWORD"));

		try {
			ResponseEntity<Void> response = restClient.post()
					.uri(adminBase() + "/users")
					.header("Authorization", "Bearer " + token)
					.contentType(MediaType.APPLICATION_JSON)
					.body(userBody)
					.retrieve()
					.toBodilessEntity();

			if (response.getStatusCode().value() == 409) {
				throw new ResponseStatusException(HttpStatus.CONFLICT, "El usuario ya existe en Keycloak");
			}

			URI location = response.getHeaders().getLocation();
			if (location == null) {
				throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
						"Keycloak no devolvió el ID del usuario creado");
			}

			String path = location.getPath();
			return path.substring(path.lastIndexOf('/') + 1);
		} catch (HttpClientErrorException e) {
			if (e.getStatusCode() == HttpStatus.CONFLICT) {
				throw new ResponseStatusException(HttpStatus.CONFLICT, "El usuario ya existe en Keycloak");
			}
			if (e.getStatusCode() == HttpStatus.FORBIDDEN) {
				throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
						"Keycloak rechazó la creación (403). El client admin no tiene roles manage-users. "
								+ "Ejecuta scripts/keycloak-grant-admin-roles.sh");
			}
			throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
					"No se pudo crear el usuario en Keycloak: " + e.getStatusCode() + " " + e.getResponseBodyAsString(), e);
		}
	}

	public void resetPassword(String userId, String password, boolean temporary) {
		String token = getAccessToken();
		Map<String, Object> credentials = new java.util.LinkedHashMap<>();
		credentials.put("type", "password");
		credentials.put("value", password);
		credentials.put("temporary", temporary);

		try {
			restClient.put()
					.uri(adminBase() + "/users/" + userId + "/reset-password")
					.header("Authorization", "Bearer " + token)
					.contentType(MediaType.APPLICATION_JSON)
					.body(credentials)
					.retrieve()
					.toBodilessEntity();
		} catch (HttpClientErrorException e) {
			throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
					"No se pudo reiniciar la contraseña en Keycloak: " + e.getResponseBodyAsString(), e);
		}
	}

	public void assignRole(String userId, String roleName) {
		assignRole(userId, roleName, roleName);
	}

	public void assignRole(String userId, String roleName, String roleDescription) {
		ensureRealmRole(roleName, roleDescription);
		String token = getAccessToken();

		try {
			Map<String, Object> roleRepresentation = restClient.get()
					.uri(adminBase() + "/roles/" + roleName)
					.header("Authorization", "Bearer " + token)
					.retrieve()
					.body(Map.class);

			if (roleRepresentation == null || !roleRepresentation.containsKey("id")) {
				throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Keycloak role not found: " + roleName);
			}

			restClient.post()
					.uri(adminBase() + "/users/" + userId + "/role-mappings/realm")
					.header("Authorization", "Bearer " + token)
					.contentType(MediaType.APPLICATION_JSON)
					.body(List.of(roleRepresentation))
					.retrieve()
					.toBodilessEntity();
		} catch (HttpClientErrorException e) {
			if (e.getStatusCode() == HttpStatus.FORBIDDEN) {
				throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
						"Keycloak rechazó asignar rol (403). Ejecuta scripts/keycloak-grant-admin-roles.sh");
			}
			throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
					"No se pudo asignar el rol en Keycloak: " + e.getResponseBodyAsString(), e);
		}
	}

	public void ensureRealmRole(String roleName, String description) {
		String token = getAccessToken();
		try {
			restClient.get()
					.uri(adminBase() + "/roles/" + roleName)
					.header("Authorization", "Bearer " + token)
					.retrieve()
					.toBodilessEntity();
			return;
		} catch (HttpClientErrorException e) {
			if (e.getStatusCode() != HttpStatus.NOT_FOUND) {
				if (e.getStatusCode() == HttpStatus.FORBIDDEN) {
					throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
							"Keycloak rechazó consultar roles (403). Ejecuta scripts/keycloak-grant-admin-roles.sh");
				}
				throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
						"No se pudo verificar el rol en Keycloak: " + e.getResponseBodyAsString(), e);
			}
		}

		Map<String, Object> roleBody = new java.util.LinkedHashMap<>();
		roleBody.put("name", roleName);
		roleBody.put("description", description != null && !description.isBlank() ? description : roleName);

		try {
			restClient.post()
					.uri(adminBase() + "/roles")
					.header("Authorization", "Bearer " + token)
					.contentType(MediaType.APPLICATION_JSON)
					.body(roleBody)
					.retrieve()
					.toBodilessEntity();
		} catch (HttpClientErrorException e) {
			if (e.getStatusCode() == HttpStatus.CONFLICT) {
				return;
			}
			if (e.getStatusCode() == HttpStatus.FORBIDDEN) {
				throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
						"Keycloak rechazó crear rol (403). Ejecuta scripts/keycloak-grant-admin-roles.sh");
			}
			throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
					"No se pudo crear el rol en Keycloak: " + e.getResponseBodyAsString(), e);
		}
	}

	public int syncRealmRoles(java.util.Collection<RoleDefinition> roles) {
		int synced = 0;
		for (RoleDefinition role : roles) {
			ensureRealmRole(role.name(), role.description());
			synced++;
		}
		return synced;
	}

	public record RoleDefinition(String name, String description) {
	}

	public void updateUserRole(String userId, String newRoleName) {
		updateUserRole(userId, newRoleName, newRoleName);
	}

	public void updateUserRole(String userId, String newRoleName, String newRoleDescription) {
		ensureRealmRole(newRoleName, newRoleDescription);
		String token = getAccessToken();

		try {
			List<Map<String, Object>> currentRoles = restClient.get()
					.uri(adminBase() + "/users/" + userId + "/role-mappings/realm")
					.header("Authorization", "Bearer " + token)
					.retrieve()
					.body(List.class);

			if (currentRoles != null && !currentRoles.isEmpty()) {
				restClient.method(org.springframework.http.HttpMethod.DELETE)
						.uri(adminBase() + "/users/" + userId + "/role-mappings/realm")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.body(currentRoles)
						.retrieve()
						.toBodilessEntity();
			}

			assignRole(userId, newRoleName, newRoleDescription);
		} catch (HttpClientErrorException e) {
			throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
					"No se pudo actualizar el rol en Keycloak: " + e.getResponseBodyAsString(), e);
		}
	}

	public java.util.Optional<String> findUserIdByEmail(String email) {
		String token = getAccessToken();

		try {
			String uri = UriComponentsBuilder
					.fromHttpUrl(adminBase() + "/users")
					.queryParam("username", email)
					.queryParam("exact", true)
					.build()
					.toUriString();

			List<Map<String, Object>> users = restClient.get()
					.uri(uri)
					.header("Authorization", "Bearer " + token)
					.retrieve()
					.body(List.class);

			if (users == null || users.isEmpty()) {
				return java.util.Optional.empty();
			}

			return users.stream()
					.filter(user -> email.equalsIgnoreCase((String) user.get("email")))
					.map(user -> (String) user.get("id"))
					.filter(java.util.Objects::nonNull)
					.findFirst()
					.or(() -> java.util.Optional.ofNullable((String) users.get(0).get("id")));
		} catch (HttpClientErrorException e) {
			if (e.getStatusCode() == HttpStatus.FORBIDDEN) {
				throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
						"Keycloak rechazó consultar usuarios (403). Ejecuta scripts/keycloak-grant-admin-roles.sh");
			}
			throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
					"No se pudo consultar el usuario en Keycloak: " + e.getResponseBodyAsString(), e);
		}
	}

	public void deleteUser(String userId) {
		String token = getAccessToken();
		try {
			restClient.delete()
					.uri(adminBase() + "/users/" + userId)
					.header("Authorization", "Bearer " + token)
					.retrieve()
					.toBodilessEntity();
		} catch (HttpClientErrorException e) {
			if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
				return;
			}
			if (e.getStatusCode() == HttpStatus.FORBIDDEN) {
				throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
						"Keycloak rechazó eliminar usuario (403). Ejecuta scripts/keycloak-grant-admin-roles.sh");
			}
			throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
					"No se pudo eliminar el usuario en Keycloak: " + e.getResponseBodyAsString(), e);
		}
	}

	public void updateUserEnabled(String userId, boolean enabled) {
		String token = getAccessToken();

		try {
			Map<String, Object> userRepresentation = restClient.get()
					.uri(adminBase() + "/users/" + userId)
					.header("Authorization", "Bearer " + token)
					.retrieve()
					.body(Map.class);

			if (userRepresentation == null || userRepresentation.isEmpty()) {
				throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
						"Keycloak did not return user data for status update");
			}

			userRepresentation.put("enabled", enabled);

			restClient.put()
					.uri(adminBase() + "/users/" + userId)
					.header("Authorization", "Bearer " + token)
					.contentType(MediaType.APPLICATION_JSON)
					.body(userRepresentation)
					.retrieve()
					.toBodilessEntity();
		} catch (HttpClientErrorException e) {
			throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
					"No se pudo actualizar el estado en Keycloak: " + e.getResponseBodyAsString(), e);
		}
	}

	public void triggerPasswordReset(String userId, String appClientId, String redirectUri) {
		String token = getAccessToken();

		String uri = UriComponentsBuilder
				.fromHttpUrl(adminBase() + "/users/" + userId + "/execute-actions-email")
				.queryParam("client_id", appClientId)
				.queryParam("redirect_uri", redirectUri)
				.queryParam("lifespan", 43200)
				.encode()
				.toUriString();

		try {
			restClient.put()
					.uri(uri)
					.header("Authorization", "Bearer " + token)
					.contentType(MediaType.APPLICATION_JSON)
					.body(List.of("UPDATE_PASSWORD"))
					.retrieve()
					.toBodilessEntity();
		} catch (HttpClientErrorException e) {
			throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
					"No se pudo enviar el correo de restablecimiento desde Keycloak: " + e.getResponseBodyAsString(), e);
		}
	}
}
