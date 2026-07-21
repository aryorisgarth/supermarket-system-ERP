package com.supermarket.user.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.supermarket.role.entity.Role;
import com.supermarket.role.repository.RoleRepository;
import com.supermarket.user.SystemUserConstants;
import com.supermarket.user.entity.User;
import com.supermarket.user.repository.UserRepository;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserArchiveService {

	private final UserRepository userRepository;
	private final RoleRepository roleRepository;
	private final PasswordEncoder passwordEncoder;
	private final EntityManager entityManager;

	@Transactional(readOnly = true)
	public User getArchiveUser() {
		return userRepository.findByEmailIgnoreCase(SystemUserConstants.ARCHIVE_EMAIL)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
						"Usuario de archivo del sistema no disponible. Ejecute las migraciones pendientes."));
	}

	@Transactional
	public User ensureArchiveUser() {
		return userRepository.findByEmailIgnoreCase(SystemUserConstants.ARCHIVE_EMAIL)
				.orElseGet(this::createArchiveUser);
	}

	@Transactional
	public void transferOperationalReferences(Long fromUserId, Long archiveUserId) {
		if (fromUserId.equals(archiveUserId)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
					"No se puede eliminar el usuario de archivo del sistema.");
		}

		List<String> reassignStatements = List.of(
				"UPDATE sales SET user_id = :archiveId WHERE user_id = :userId",
				"UPDATE credit_notes SET user_id = :archiveId WHERE user_id = :userId",
				"UPDATE inventory_movements SET user_id = :archiveId WHERE user_id = :userId",
				"UPDATE cash_register_sessions SET user_id = :archiveId WHERE user_id = :userId",
				"UPDATE cash_register_movements SET user_id = :archiveId WHERE user_id = :userId",
				"UPDATE purchase_orders SET created_by_id = :archiveId WHERE created_by_id = :userId",
				"UPDATE inventory_count_sessions SET created_by = :archiveId WHERE created_by = :userId",
				"UPDATE daily_closures SET closed_by_id = :archiveId WHERE closed_by_id = :userId");

		for (String sql : reassignStatements) {
			entityManager.createNativeQuery(sql)
					.setParameter("archiveId", archiveUserId)
					.setParameter("userId", fromUserId)
					.executeUpdate();
		}

		List<String> nullifyStatements = List.of(
				"UPDATE purchase_orders SET received_by_id = NULL WHERE received_by_id = :userId",
				"UPDATE inventory_count_sessions SET approved_by = NULL WHERE approved_by = :userId",
				"UPDATE inventory_count_sessions SET counted_by_id = NULL WHERE counted_by_id = :userId",
				"UPDATE system_alerts SET resolved_by_id = NULL WHERE resolved_by_id = :userId",
				"UPDATE audit_logs SET user_id = NULL WHERE user_id = :userId",
				"UPDATE product_cost_history SET user_id = NULL WHERE user_id = :userId",
				"UPDATE product_sale_price_history SET user_id = NULL WHERE user_id = :userId");

		for (String sql : nullifyStatements) {
			entityManager.createNativeQuery(sql)
					.setParameter("userId", fromUserId)
					.executeUpdate();
		}

		entityManager.flush();
		log.info("Referencias operativas del usuario {} transferidas al usuario de archivo {}", fromUserId,
				archiveUserId);
	}

	public boolean isSystemUser(User user) {
		return user != null && Boolean.TRUE.equals(user.getIsSystem());
	}

	private User createArchiveUser() {
		Role role = roleRepository.findByNameIgnoreCase("CONSULTOR")
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
						"No existe el rol CONSULTOR para crear el usuario de archivo."));

		User archive = new User();
		archive.setFullName(SystemUserConstants.ARCHIVE_FULL_NAME);
		archive.setEmail(SystemUserConstants.ARCHIVE_EMAIL);
		archive.setPassword(passwordEncoder.encode("SYSTEM_ARCHIVE_USER_NOT_LOGIN"));
		archive.setIsActive(false);
		archive.setIsSystem(true);
		archive.setRole(role);
		archive.setCreatedAt(LocalDateTime.now());
		return userRepository.save(archive);
	}
}
