package com.supermarket.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import com.supermarket.role.entity.Role;
import com.supermarket.role.repository.RoleRepository;
import com.supermarket.user.service.KeycloakAdminService;
import com.supermarket.user.service.KeycloakAdminService.RoleDefinition;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@Profile("!test")
@Order(200)
@RequiredArgsConstructor
@Slf4j
public class KeycloakRoleSyncRunner implements ApplicationRunner {

	private final RoleRepository roleRepository;
	private final KeycloakAdminService keycloakAdminService;

	@Value("${app.keycloak.admin.sync-roles-on-startup:true}")
	private boolean syncRolesOnStartup;

	@Override
	public void run(ApplicationArguments args) {
		if (!syncRolesOnStartup) {
			return;
		}

		List<Role> roles = roleRepository.findAllByOrderByNameAsc();
		if (roles.isEmpty()) {
			log.info("Keycloak role sync omitido: no hay roles en la base de datos.");
			return;
		}

		List<RoleDefinition> definitions = roles.stream()
				.map(role -> new RoleDefinition(role.getName(), role.getDescription()))
				.toList();

		int maxAttempts = 12;
		for (int attempt = 1; attempt <= maxAttempts; attempt++) {
			try {
				int synced = keycloakAdminService.syncRealmRoles(definitions);
				log.info("Roles de aplicacion sincronizados con Keycloak: {}", synced);
				return;
			} catch (Exception ex) {
				log.warn("Intento {}/{} de sincronizar roles con Keycloak fallo: {}", attempt, maxAttempts,
						ex.getMessage());
				if (attempt == maxAttempts) {
					log.error(
							"No se pudieron sincronizar roles con Keycloak al arrancar. Verifica que Keycloak este activo y que supermarket-admin-client tenga permisos manage-realm.");
					return;
				}
				sleepBeforeRetry();
			}
		}
	}

	private void sleepBeforeRetry() {
		try {
			Thread.sleep(3000L);
		} catch (InterruptedException interrupted) {
			Thread.currentThread().interrupt();
		}
	}
}
