package com.supermarket.security;

import java.util.Locale;

public final class RoleNames {

	private RoleNames() {
	}

	
	public static String toAuthority(String roleName) {
		return "ROLE_" + roleName.trim().toUpperCase(Locale.ROOT).replace(' ', '_').replace('-', '_');
	}
}
