package com.supermarket.audit.model;

import java.util.List;
import java.util.Locale;

public enum AuditActionCategory {
	CREATE,
	UPDATE,
	DELETE,
	ACCESS,
	OTHER;

	public static AuditActionCategory fromAction(String action) {
		if (action == null || action.isBlank()) {
			return OTHER;
		}
		String normalized = action.trim().toUpperCase(Locale.ROOT);
		if (List.of("CREATE", "INSERT", "SALE_CREATE", "CASH_OPEN", "LOGIN").contains(normalized)) {
			return CREATE;
		}
		if (List.of("DELETE", "REMOVE", "SALE_CANCEL").contains(normalized)) {
			return DELETE;
		}
		if ("ACCESS_DENIED".equals(normalized)) {
			return ACCESS;
		}
		if (List.of("UPDATE", "CASH_CLOSE", "CASH_MOVEMENT", "ROLE_PERMISSIONS_UPDATE",
				"INVENTORY_ADJUSTMENT", "SALE_REFUND").contains(normalized)) {
			return UPDATE;
		}
		return OTHER;
	}

	public static List<String> actionsFor(AuditActionCategory category) {
		if (category == null) {
			return List.of();
		}
		return switch (category) {
			case CREATE -> List.of("CREATE", "INSERT", "SALE_CREATE", "CASH_OPEN", "LOGIN");
			case UPDATE -> List.of("UPDATE", "CASH_CLOSE", "CASH_MOVEMENT", "ROLE_PERMISSIONS_UPDATE",
					"INVENTORY_ADJUSTMENT", "SALE_REFUND");
			case DELETE -> List.of("DELETE", "REMOVE", "SALE_CANCEL");
			case ACCESS -> List.of("ACCESS_DENIED");
			case OTHER -> List.of();
		};
	}
}
