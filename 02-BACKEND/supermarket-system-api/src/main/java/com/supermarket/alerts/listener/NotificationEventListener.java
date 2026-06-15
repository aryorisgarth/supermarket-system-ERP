package com.supermarket.alerts.listener;

import java.util.List;

import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import com.supermarket.alerts.entity.NotificationRule;
import com.supermarket.alerts.event.NotificationEvent;
import com.supermarket.alerts.repository.NotificationRuleRepository;
import com.supermarket.alerts.service.EmailSenderService;
import com.supermarket.alerts.service.SystemAlertService;
import com.supermarket.user.entity.User;
import com.supermarket.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationEventListener {

	private final NotificationRuleRepository ruleRepository;
	private final SystemAlertService systemAlertService;
	private final EmailSenderService emailSenderService;
	private final UserRepository userRepository;

	@Async
	@EventListener
	public void handleNotificationEvent(NotificationEvent event) {
		log.info("Recibido evento de notificación interna: {} ({})", event.getTitle(), event.getAlertType());

		
		List<NotificationRule> matchingRules = ruleRepository
				.findByAlertTypeAndSeverityAndIsActiveTrue(event.getAlertType(), event.getSeverity());

		if (matchingRules.isEmpty()) {
			log.info("No se encontraron reglas de enrutamiento activas para Tipo: {}, Severidad: {}",
					event.getAlertType(), event.getSeverity());
			return;
		}

		for (NotificationRule rule : matchingRules) {
			if ("EMAIL".equalsIgnoreCase(rule.getChannel())) {
				
				List<User> usersToNotify = userRepository.findByRoleIdAndIsActive(rule.getRole().getId(), true);

				if (usersToNotify.isEmpty()) {
					log.warn("No hay usuarios activos registrados para el Rol ID: {} (Regla ID: {})",
							rule.getRole().getId(), rule.getId());
					continue;
				}

				for (User user : usersToNotify) {
					if (user.getEmail() != null && !user.getEmail().isBlank()) {
						log.info("Despachando correo asíncrono para {} a la dirección {}", user.getFullName(), user.getEmail());
						emailSenderService.sendHtmlEmail(
								user.getEmail(),
								"ALERTA SUPERNOVA: " + event.getTitle(),
								event.getMessage(),
								event.getSeverity());
					}
				}
			}
		}
	}
}
