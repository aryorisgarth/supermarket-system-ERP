package com.supermarket.user.service;

import java.net.URI;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
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
			throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to authenticate with Keycloak: " + e.getResponseBodyAsString(), e);
		}
	}

	public String createUser(String email, String firstName, String lastName, String tempPassword) {
		String token = getAccessToken();

		Map<String, Object> credentials = Map.of(
				"type", "password",
				"value", tempPassword,
				"temporary", true
		);

		Map<String, Object> userBody = Map.of(
				"username", email,
				"email", email,
				"enabled", true,
				"emailVerified", true,
				"firstName", firstName,
				"lastName", lastName,
				"credentials", List.of(credentials),
				"requiredActions", List.of("UPDATE_PASSWORD")
		);

		try {
			ResponseEntity<Void> response = restClient.post()
					.uri(serverUrl + "/admin/realms/" + realm + "/users")
					.header("Authorization", "Bearer " + token)
					.contentType(MediaType.APPLICATION_JSON)
					.body(userBody)
					.retrieve()
					.toBodilessEntity();

			if (response.getStatusCode().value() == 409) {
				throw new ResponseStatusException(HttpStatus.CONFLICT, "User already exists in Keycloak");
			}

			URI location = response.getHeaders().getLocation();
			if (location == null) {
				throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Keycloak did not return location header for new user");
			}

			String path = location.getPath();
			return path.substring(path.lastIndexOf('/') + 1);
		} catch (HttpClientErrorException e) {
			if (e.getStatusCode() == HttpStatus.CONFLICT) {
				throw new ResponseStatusException(HttpStatus.CONFLICT, "User already exists in Keycloak");
			}
			throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to create user in Keycloak: " + e.getResponseBodyAsString(), e);
		}
	}

	public void assignRole(String userId, String roleName) {
		String token = getAccessToken();

		try {
			Map<String, Object> roleRepresentation = restClient.get()
					.uri(serverUrl + "/admin/realms/" + realm + "/roles/" + roleName)
					.header("Authorization", "Bearer " + token)
					.retrieve()
					.body(Map.class);

			if (roleRepresentation == null || !roleRepresentation.containsKey("id")) {
				throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Keycloak role not found: " + roleName);
			}

			restClient.post()
					.uri(serverUrl + "/admin/realms/" + realm + "/users/" + userId + "/role-mappings/realm")
					.header("Authorization", "Bearer " + token)
					.contentType(MediaType.APPLICATION_JSON)
					.body(List.of(roleRepresentation))
					.retrieve()
					.toBodilessEntity();
		} catch (HttpClientErrorException e) {
			throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to assign role in Keycloak: " + e.getResponseBodyAsString(), e);
		}
	}

	public java.util.Optional<String> findUserIdByEmail(String email) {
		String token = getAccessToken();

		try {
			List<Map<String, Object>> users = restClient.get()
					.uri(serverUrl + "/admin/realms/" + realm + "/users?email=" + email)
					.header("Authorization", "Bearer " + token)
					.retrieve()
					.body(List.class);

			if (users == null || users.isEmpty()) {
				return java.util.Optional.empty();
			}

			Map<String, Object> user = users.get(0);
			return java.util.Optional.ofNullable((String) user.get("id"));
		} catch (HttpClientErrorException e) {
			throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to query user by email in Keycloak: " + e.getResponseBodyAsString(), e);
		}
	}

	public void triggerPasswordReset(String userId, String appClientId, String redirectUri) {
		String token = getAccessToken();

		try {
			restClient.put()
					.uri(serverUrl + "/admin/realms/" + realm + "/users/" + userId + "/execute-actions-email?client_id=" + appClientId + "&redirect_uri=" + redirectUri)
					.header("Authorization", "Bearer " + token)
					.contentType(MediaType.APPLICATION_JSON)
					.body(List.of("UPDATE_PASSWORD"))
					.retrieve()
					.toBodilessEntity();
		} catch (HttpClientErrorException e) {
			throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to trigger execute-actions-email in Keycloak: " + e.getResponseBodyAsString(), e);
		}
	}
}
