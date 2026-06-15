package com.supermarket.alerts.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.supermarket.alerts.dto.NotificationRuleRequestDTO;
import com.supermarket.alerts.dto.NotificationRuleResponseDTO;
import com.supermarket.alerts.entity.NotificationRule;
import com.supermarket.alerts.repository.NotificationRuleRepository;
import com.supermarket.role.entity.Role;
import com.supermarket.role.repository.RoleRepository;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/notification-rules")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMINISTRADOR', 'ADMIN_INGENIERO')")
public class NotificationRuleController {

	private final NotificationRuleRepository ruleRepository;
	private final RoleRepository roleRepository;

	@GetMapping
	public ResponseEntity<List<NotificationRuleResponseDTO>> list() {
		List<NotificationRule> rules = ruleRepository.findAll();
		List<NotificationRuleResponseDTO> response = rules.stream()
				.map(this::toResponse)
				.toList();
		return ResponseEntity.ok(response);
	}

	@PostMapping
	@Transactional
	public ResponseEntity<NotificationRuleResponseDTO> create(@Valid @RequestBody NotificationRuleRequestDTO request) {
		Role role = roleRepository.findById(request.getRoleId())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Rol no encontrado"));

		
		boolean exists = ruleRepository.findAll().stream().anyMatch(r ->
				r.getAlertType().equalsIgnoreCase(request.getAlertType())
				&& r.getSeverity().equalsIgnoreCase(request.getSeverity())
				&& r.getChannel().equalsIgnoreCase(request.getChannel())
				&& r.getRole().getId().equals(request.getRoleId())
		);

		if (exists) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ya existe una regla idéntica configurada");
		}

		NotificationRule rule = new NotificationRule();
		rule.setAlertType(request.getAlertType());
		rule.setSeverity(request.getSeverity());
		rule.setChannel(request.getChannel());
		rule.setRole(role);
		rule.setIsActive(true);
		rule.setCreatedAt(LocalDateTime.now());
		rule.setUpdatedAt(LocalDateTime.now());

		NotificationRule saved = ruleRepository.save(rule);
		return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(saved));
	}

	@PutMapping("/{id}/toggle")
	@Transactional
	public ResponseEntity<NotificationRuleResponseDTO> toggle(@PathVariable Long id) {
		NotificationRule rule = ruleRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Regla no encontrada"));

		rule.setIsActive(!rule.getIsActive());
		rule.setUpdatedAt(LocalDateTime.now());

		NotificationRule saved = ruleRepository.save(rule);
		return ResponseEntity.ok(toResponse(saved));
	}

	@DeleteMapping("/{id}")
	@Transactional
	public ResponseEntity<Void> delete(@PathVariable Long id) {
		NotificationRule rule = ruleRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Regla no encontrada"));

		ruleRepository.delete(rule);
		return ResponseEntity.noContent().build();
	}

	private NotificationRuleResponseDTO toResponse(NotificationRule rule) {
		return new NotificationRuleResponseDTO(
				rule.getId(),
				rule.getAlertType(),
				rule.getSeverity(),
				rule.getChannel(),
				rule.getRole().getId(),
				rule.getRole().getName(),
				rule.getIsActive(),
				rule.getCreatedAt(),
				rule.getUpdatedAt()
		);
	}
}
