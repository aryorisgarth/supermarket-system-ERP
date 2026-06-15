package com.supermarket.security;

import java.io.IOException;
import java.util.List;
import java.util.ArrayList;

import org.springframework.http.HttpHeaders;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

	private final JwtService jwtService;

	@Override
	protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response,
			@NonNull FilterChain filterChain) throws ServletException, IOException {
		String header = request.getHeader(HttpHeaders.AUTHORIZATION);
		if (header != null && header.startsWith("Bearer ")) {
			String token = header.substring(7).trim();
			if (!token.isEmpty()) {
				try {
					Claims claims = jwtService.parseAndValidate(token);
					Long uid = claims.get("uid", Long.class);
					String email = claims.getSubject();
					String role = claims.get("role", String.class);
					if (uid != null && email != null && role != null) {
						List<SimpleGrantedAuthority> authorities = new ArrayList<>();
						authorities.add(new SimpleGrantedAuthority(RoleNames.toAuthority(role)));
						Object permissionsClaim = claims.get("permissions");
						if (permissionsClaim instanceof List<?> permissions) {
							permissions.stream()
									.filter(String.class::isInstance)
									.map(String.class::cast)
									.map(SimpleGrantedAuthority::new)
									.forEach(authorities::add);
						}
						var principal = new LoggedUser(uid, email, "", true, authorities);
						var auth = new UsernamePasswordAuthenticationToken(principal, null, authorities);
						SecurityContextHolder.getContext().setAuthentication(auth);
					}
				} catch (Exception ignored) {
					SecurityContextHolder.clearContext();
				}
			}
		}
		filterChain.doFilter(request, response);
	}
}
