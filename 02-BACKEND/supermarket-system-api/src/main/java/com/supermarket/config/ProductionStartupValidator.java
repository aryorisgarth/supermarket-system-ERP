package com.supermarket.config;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Profile;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@Profile("prod")
@RequiredArgsConstructor
@Slf4j
public class ProductionStartupValidator {

	private static final String DEFAULT_JWT_SECRET =
			"0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

	private final JwtProperties jwtProperties;

	@EventListener(ApplicationReadyEvent.class)
	public void validateProductionSecrets() {
		if (DEFAULT_JWT_SECRET.equals(jwtProperties.secret())) {
			throw new IllegalStateException(
					"JWT_SECRET no configurado: defina una clave segura (mín. 256 bits) en producción");
		}
		log.info("Validación de producción: JWT_SECRET configurado correctamente");
	}
}
