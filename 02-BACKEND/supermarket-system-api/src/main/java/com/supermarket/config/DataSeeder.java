package com.supermarket.config;

import java.time.LocalDateTime;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.supermarket.role.entity.Role;
import com.supermarket.role.repository.RoleRepository;
import com.supermarket.user.entity.User;
import com.supermarket.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@Profile("!test")
@Order
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements ApplicationRunner {

	private final AppSeedProperties appSeedProperties;
	private final RoleRepository roleRepository;
	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;

	@Override
	public void run(ApplicationArguments args) {
		if (!appSeedProperties.enabled()) {
			return;
		}
		if (roleRepository.count() == 0) {
			seedRoles();
		} else {
			ensureRole("BODEGUERO", "Recepcion de mercaderia, lotes y ordenamiento en bodega");
		}
		syncDemoUsers();
	}

	private void seedRoles() {
		saveRole("CAJERO", "Operaciones de venta y cobro en caja");
		saveRole("BODEGUERO", "Recepcion de mercaderia, lotes y ordenamiento en bodega");
		saveRole("ADMINISTRADOR", "Acceso total a la gestión del negocio");
		saveRole("SUPERVISOR", "Supervisión de operaciones y arqueos de caja");
		saveRole("CONSULTOR", "Acceso de solo lectura para auditoría y reportes");
		saveRole("ADMIN_INGENIERO", "Acceso técnico total y gestión de backups");
		log.info("Roles iniciales creados (CAJERO, BODEGUERO, ADMINISTRADOR, SUPERVISOR, CONSULTOR, ADMIN_INGENIERO)");
	}

	private void saveRole(String name, String description) {
		Role role = new Role();
		role.setName(name);
		role.setDescription(description);
		roleRepository.save(role);
	}

	private void ensureRole(String name, String description) {
		roleRepository.findByNameIgnoreCase(name).orElseGet(() -> {
			Role role = new Role();
			role.setName(name);
			role.setDescription(description);
			return roleRepository.save(role);
		});
	}

	
	private void syncDemoUsers() {
		upsertDemoUser("admin@supermarket.local", "Admin12345!", "ADMIN_INGENIERO", "Admin Ingeniero");
		upsertDemoUser("administrador@supermarket.local", "Admin12345!", "ADMINISTRADOR", "Administrador Demo");
		upsertDemoUser("supervisor@supermarket.local", "Supervisor12345!", "SUPERVISOR", "Supervisor Demo");
		upsertDemoUser("consultor@supermarket.local", "Consultor12345!", "CONSULTOR", "Consultor Demo");
		upsertDemoUser("cajero@supermarket.local", "Cajero12345!", "CAJERO", "Cajero Demo");
		upsertDemoUser("bodeguero@supermarket.local", "Bodeguero12345!", "BODEGUERO", "Bodeguero Demo");
		log.info("""
				Usuarios demo sincronizados (SEED_ENABLED=true):
				  admin@supermarket.local / Admin12345!
				  administrador@supermarket.local / Admin12345!
				  supervisor@supermarket.local / Supervisor12345!
				  consultor@supermarket.local / Consultor12345!
				  cajero@supermarket.local / Cajero12345!
				  bodeguero@supermarket.local / Bodeguero12345!
				""");
	}

	private void upsertDemoUser(String email, String rawPassword, String roleName, String fullName) {
		Role role = roleRepository.findByNameIgnoreCase(roleName)
				.orElseGet(() -> {
					Role created = new Role();
					created.setName(roleName);
					created.setDescription("Rol " + roleName);
					return roleRepository.save(created);
				});

		User user = userRepository.findByEmailWithRole(email).orElseGet(User::new);
		if (user.getId() == null) {
			user.setCreatedAt(LocalDateTime.now());
		}
		user.setEmail(email);
		user.setFullName(fullName);
		user.setPassword(passwordEncoder.encode(rawPassword));
		user.setIsActive(true);
		user.setRole(role);
		userRepository.save(user);
	}
}
