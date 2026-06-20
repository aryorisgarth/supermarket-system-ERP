package com.supermarket.security;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.authorization.AuthorizationManager;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtTimestampValidator;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.intercept.RequestAuthorizationContext;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.supermarket.config.AppCorsProperties;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfiguration {

	private final CustomUserDetailsService customUserDetailsService;
	private final AppCorsProperties appCorsProperties;
	private final KeycloakJwtAuthenticationConverter keycloakJwtAuthenticationConverter;

	@Value("${spring.security.oauth2.resourceserver.jwt.jwk-set-uri:#{null}}")
	private String jwkSetUri;

	@Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri:#{null}}")
	private String issuerUri;

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http, PasswordEncoder passwordEncoder) throws Exception {
		http.csrf(AbstractHttpConfigurer::disable)
				.cors(cors -> cors.configurationSource(corsConfigurationSource()))
				.exceptionHandling(eh -> eh
						.authenticationEntryPoint((request, response, authException) -> {
							String authHeader = request.getHeader("Authorization");
							org.slf4j.LoggerFactory.getLogger(SecurityConfiguration.class).warn(
									"Unauthorized request {} {} - bearerHeader={} - reason={}",
									request.getMethod(),
									request.getRequestURI(),
									authHeader != null && authHeader.startsWith("Bearer "),
									authException.getMessage());
							response.setStatus(jakarta.servlet.http.HttpServletResponse.SC_UNAUTHORIZED);
							response.setContentType("application/json");
							response.getWriter().write("{\"message\": \"Sesión no válida o expirada. Por favor inicie sesión.\"}");
						})
				)
				.sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.oauth2ResourceServer(oauth2 -> oauth2
						.jwt(jwt -> jwt.jwtAuthenticationConverter(keycloakJwtAuthenticationConverter)))
				.authorizeHttpRequests(auth -> auth
						.requestMatchers("/api/auth/login", "/api/auth/refresh", "/api/auth/logout", "/api/products/active").permitAll()
						.requestMatchers(HttpMethod.GET, "/api/auth/me").authenticated()
						.requestMatchers(HttpMethod.POST, "/api/auth/change-password").authenticated()
						.requestMatchers("/actuator/health", "/actuator/info").permitAll()
						.requestMatchers("/actuator/**").hasRole("ADMIN_INGENIERO")
						.requestMatchers(
								"/swagger-ui/**",
								"/swagger-ui.html",
								"/v3/api-docs/**",
								"/v3/api-docs.yaml").permitAll()
						
						
						.requestMatchers(HttpMethod.GET, "/api/cash-registers/physical/active").access(anyRoleOrAuthority(
										new String[] {"ADMINISTRADOR", "ADMIN_INGENIERO", "CAJERO", "SUPERVISOR"},
										new String[] {"CASH_OPEN", "CASH_MOVE", "CASH_CLOSE"}))
						.requestMatchers("/api/cash-registers/physical/**")
								.access(anyRoleOrAuthority(
										new String[] {"ADMINISTRADOR", "ADMIN_INGENIERO", "SUPERVISOR"},
										new String[] {"CASH_CLOSE"}))
						.requestMatchers(HttpMethod.POST, "/api/cash-registers/open").hasAuthority("CASH_OPEN")
						.requestMatchers(HttpMethod.POST, "/api/cash-registers/close").hasAuthority("CASH_CLOSE")
						.requestMatchers(HttpMethod.POST, "/api/cash-registers/movements").hasAuthority("CASH_MOVE")
						.requestMatchers(HttpMethod.GET, "/api/cash-registers/sessions/**", "/api/cash-registers/report")
								.access(anyRoleOrAuthority(
										new String[] {"ADMINISTRADOR", "ADMIN_INGENIERO", "SUPERVISOR"},
										new String[] {"CASH_CLOSE", "CASH_MOVE"}))
						.requestMatchers("/api/cash-registers/**")
								.access(anyRoleOrAuthority(
										new String[] {"ADMINISTRADOR", "ADMIN_INGENIERO", "CAJERO", "SUPERVISOR"},
										new String[] {"CASH_OPEN", "CASH_MOVE", "CASH_CLOSE"}))
						
						
						.requestMatchers("/api/maintenance/**").hasRole("ADMIN_INGENIERO")
						
						.requestMatchers("/api/purchase-orders/*/receive").hasAuthority("PURCHASE_RECEIVE")
						.requestMatchers(HttpMethod.GET, "/api/purchase-orders", "/api/purchase-orders/*")
								.access(anyRoleOrAuthority(
										new String[] {"BODEGUERO", "ADMINISTRADOR", "ADMIN_INGENIERO", "SUPERVISOR"},
										new String[] {"PURCHASE_MANAGE", "PURCHASE_RECEIVE"}))
						.requestMatchers("/api/purchase-orders/**").hasAuthority("PURCHASE_MANAGE")
						.requestMatchers(HttpMethod.POST, "/api/inventory-counts/*/approve")
								.hasAuthority("INVENTORY_ADJUST")
						.requestMatchers(HttpMethod.GET, "/api/inventory-counts", "/api/inventory-counts/*")
								.access(anyRoleOrAuthority(
										new String[] {"BODEGUERO", "ADMINISTRADOR", "ADMIN_INGENIERO", "SUPERVISOR"},
										new String[] {"INVENTORY_COUNT", "INVENTORY_ADJUST", "INVENTORY_VIEW"}))
						.requestMatchers("/api/inventory-counts/**")
								.access(anyRoleOrAuthority(
										new String[] {"BODEGUERO", "ADMINISTRADOR", "ADMIN_INGENIERO", "SUPERVISOR"},
										new String[] {"INVENTORY_COUNT"}))
						.requestMatchers(HttpMethod.POST, "/api/inventory-movements").hasAuthority("INVENTORY_ADJUST")
						.requestMatchers(HttpMethod.GET, "/api/inventory-movements", "/api/inventory-movements/**")
								.access(anyRoleOrAuthority(
										new String[] {"BODEGUERO", "ADMINISTRADOR", "ADMIN_INGENIERO", "SUPERVISOR", "CONSULTOR"},
										new String[] {"INVENTORY_VIEW", "INVENTORY_ADJUST", "REPORT_VIEW"}))
						.requestMatchers(HttpMethod.GET, "/api/promotions", "/api/promotions/**").authenticated()
						.requestMatchers("/api/promotions/**").hasAuthority("PROMO_MANAGE")
						.requestMatchers(HttpMethod.POST, "/api/product-batches/write-off-expired")
								.hasAuthority("INVENTORY_ADJUST")
						.requestMatchers(HttpMethod.GET, "/api/product-batches/**")
								.access(anyRoleOrAuthority(
										new String[] {"BODEGUERO", "ADMINISTRADOR", "ADMIN_INGENIERO", "SUPERVISOR", "CAJERO"},
										new String[] {"INVENTORY_VIEW", "INVENTORY_ADJUST", "BATCH_MANAGE", "SALE_CREATE"}))
						.requestMatchers(HttpMethod.DELETE, "/api/product-batches/**")
								.access(anyRoleOrAuthority(
										new String[] {"ADMINISTRADOR", "ADMIN_INGENIERO", "SUPERVISOR"},
										new String[] {"INVENTORY_ADJUST"}))
						.requestMatchers("/api/product-batches/**")
								.access(anyRoleOrAuthority(
										new String[] {"BODEGUERO", "ADMINISTRADOR", "ADMIN_INGENIERO", "SUPERVISOR"},
										new String[] {"INVENTORY_ADJUST", "BATCH_MANAGE"}))
						.requestMatchers("/api/daily-closures/**")
								.access(anyRoleOrAuthority(
										new String[] {"ADMINISTRADOR", "ADMIN_INGENIERO", "SUPERVISOR"},
										new String[] {"CASH_CLOSE"}))
						.requestMatchers("/api/system-alerts/**")
								.access(anyRoleOrAuthority(
										new String[] {"ADMINISTRADOR", "ADMIN_INGENIERO", "SUPERVISOR", "BODEGUERO"},
										new String[] {"REPORT_VIEW"}))
						.requestMatchers("/api/reports/**")
								.access(anyRoleOrAuthority(
										new String[] {"ADMINISTRADOR", "ADMIN_INGENIERO", "SUPERVISOR", "CONSULTOR"},
										new String[] {"REPORT_VIEW"}))
						.requestMatchers("/api/users/**", "/api/roles/**", "/api/permissions/**")
								.hasAuthority("USER_MANAGE")
						
						
						.requestMatchers(HttpMethod.GET, "/api/billing/electronic-invoices/verify").permitAll()
						.requestMatchers(HttpMethod.GET, "/api/billing/payment-accounts/**")
								.access(anyRoleOrAuthority(
										new String[] {"ADMINISTRADOR", "ADMIN_INGENIERO", "SUPERVISOR", "CAJERO"},
										new String[] {"FINANCE_VIEW", "SALE_CREATE"}))
						.requestMatchers(HttpMethod.GET, "/api/billing/payment-transactions")
								.hasAuthority("FINANCE_VIEW")
						.requestMatchers("/api/billing/payment-accounts/**", "/api/billing/payment-transactions")
								.hasAuthority("FINANCE_MANAGE")
						
						
						.requestMatchers(HttpMethod.GET,
								"/api/products", "/api/products/**",
								"/api/brands", "/api/brands/**",
								"/api/locations", "/api/locations/**",
								"/api/customers", "/api/customers/**",
								"/api/sales", "/api/sales/**",
								"/api/credit-notes", "/api/credit-notes/**",
								"/api/billing", "/api/billing/**",
								"/api/categories", "/api/categories/**",
								"/api/suppliers", "/api/suppliers/**",
								"/api/tax-categories", "/api/tax-categories/**",
								"/api/dashboard/**")
								.access(anyRoleOrAuthority(
										new String[] {"BODEGUERO", "CAJERO", "ADMINISTRADOR", "ADMIN_INGENIERO", "SUPERVISOR", "CONSULTOR"},
										new String[] {
												"SALE_CREATE", "SALE_CANCEL", "PURCHASE_MANAGE", "PURCHASE_RECEIVE",
												"INVENTORY_VIEW", "INVENTORY_ADJUST", "REPORT_VIEW", "FINANCE_VIEW", "FINANCE_MANAGE"
										}))
						
						
						.requestMatchers(HttpMethod.POST, "/api/sales", "/api/customers")
								.hasAuthority("SALE_CREATE")
						.requestMatchers(HttpMethod.PUT, "/api/customers/*")
								.access(anyRoleOrAuthority(
										new String[] {"ADMINISTRADOR", "ADMIN_INGENIERO", "SUPERVISOR", "CAJERO"},
										new String[] {}))
						.requestMatchers(HttpMethod.PATCH, "/api/customers/*/points")
								.access(anyRoleOrAuthority(
										new String[] {"ADMINISTRADOR", "ADMIN_INGENIERO", "SUPERVISOR"},
										new String[] {}))
						.requestMatchers(HttpMethod.PUT, "/api/sales/*/cancel")
								.hasAuthority("SALE_CANCEL")
						.requestMatchers(HttpMethod.POST, "/api/sales/*/refund")
								.hasAuthority("SALE_CANCEL")
						
						
						.requestMatchers("/api/**").hasAnyRole("ADMINISTRADOR", "ADMIN_INGENIERO")
						.anyRequest().authenticated())
				.authenticationProvider(daoAuthenticationProvider(passwordEncoder));
		return http.build();
	}

	private AuthorizationManager<RequestAuthorizationContext> anyRoleOrAuthority(String[] roles, String[] authorities) {
		Set<String> accepted = Arrays.stream(roles)
				.map(role -> "ROLE_" + role)
				.collect(Collectors.toSet());
		accepted.addAll(Arrays.asList(authorities));

		return (authentication, context) -> {
			var auth = authentication.get();
			boolean granted = auth != null
					&& auth.isAuthenticated()
					&& auth.getAuthorities().stream()
							.anyMatch(authority -> accepted.contains(authority.getAuthority()));
			return new AuthorizationDecision(granted);
		};
	}

	@Bean
	public DaoAuthenticationProvider daoAuthenticationProvider(PasswordEncoder passwordEncoder) {
		DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
		provider.setUserDetailsService(customUserDetailsService);
		provider.setPasswordEncoder(passwordEncoder);
		return provider;
	}

	@Bean
	public JwtDecoder jwtDecoder() {
		String uri = jwkSetUri != null ? jwkSetUri : issuerUri + "/protocol/openid-connect/certs";
		NimbusJwtDecoder jwtDecoder = NimbusJwtDecoder.withJwkSetUri(uri).build();
		OAuth2TokenValidator<Jwt> withTimestamp = new JwtTimestampValidator();
		jwtDecoder.setJwtValidator(withTimestamp);
		return jwtDecoder;
	}

	@Bean
	public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
		return configuration.getAuthenticationManager();
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration configuration = new CorsConfiguration();
		configuration.setAllowedOrigins(appCorsProperties.allowedOriginList());
		configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
		configuration.setAllowedHeaders(Arrays.asList("authorization", "content-type", "x-auth-token"));
		configuration.setExposedHeaders(Arrays.asList("x-auth-token"));
		configuration.setAllowCredentials(true);
		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", configuration);
		return source;
	}
}