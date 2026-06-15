package com.supermarket.security;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

public final class SecurityUtils {

	private SecurityUtils() {
	}

	public static Long currentUserId() {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		if (auth == null || !(auth.getPrincipal() instanceof LoggedUser user)) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
		}
		return user.getId();
	}

	public static boolean hasAuthority(String authority) {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		if (auth == null || authority == null) {
			return false;
		}
		return auth.getAuthorities().stream()
				.anyMatch(grantedAuthority -> authority.equals(grantedAuthority.getAuthority()));
	}
}
