package com.supermarket.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

	private static final String SECURITY_SCHEME_NAME = "bearerAuth";

	@Bean
	public OpenAPI supermarketOpenAPI() {
		return new OpenAPI()
				.info(new Info()
						.title("Supermarket System API")
						.description("""
								API REST para la gestión completa de un sistema de supermercado.
								
								## Funcionalidades principales:
								- 🔐 **Autenticación** — Login con JWT, roles: ADMINISTRADOR, VENDEDOR, CONSULTA
								- 📦 **Inventario** — Gestión de productos, lotes (batches) y movimientos de stock
								- 🧾 **Ventas** — Facturación con pagos múltiples y cálculo automático de vuelto
								- 🏧 **Caja Registradora** — Control de turnos, apertura/cierre y cuadre de efectivo
								- 📊 **Reportes** — Estadísticas de ventas, productos más vendidos y balance diario
								- 💰 **Devoluciones** — Notas de crédito vinculadas a la caja activa del turno
								
								## Autenticación
								Todos los endpoints (excepto `/api/auth/login`) requieren el header:
								`Authorization: Bearer <token>`
								""")
						.version("3.0.0")
						.contact(new Contact()
								.name("Adolfo Floreano Garth")
								.email("admin@supermarket.local"))
						.license(new License()
								.name("Uso Académico — Examen de Grado")
								.url("#")))
				.servers(List.of(
						new Server().url("http://localhost:8080").description("Servidor de Desarrollo"),
						new Server().url("https://api.supermarket.local").description("Servidor de Producción")))
				.addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME))
				.components(new Components()
						.addSecuritySchemes(SECURITY_SCHEME_NAME, new SecurityScheme()
								.name(SECURITY_SCHEME_NAME)
								.type(SecurityScheme.Type.HTTP)
								.scheme("bearer")
								.bearerFormat("JWT")
								.description("Ingresa el token JWT obtenido en /api/auth/login")));
	}
}
