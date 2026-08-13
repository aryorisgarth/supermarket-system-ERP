package com.supermarket.audit.mapper;

import org.springframework.stereotype.Component;

import com.supermarket.audit.dto.AuditActorDTO;
import com.supermarket.audit.dto.AuditContextDTO;
import com.supermarket.audit.dto.AuditLogResponseDTO;
import com.supermarket.audit.dto.AuditPayloadDTO;
import com.supermarket.audit.dto.AuditTargetDTO;
import com.supermarket.audit.entity.AuditLog;
import com.supermarket.audit.model.AuditActionCategory;

@Component
public class AuditLogMapper {

	public AuditLogResponseDTO toResponse(AuditLog entity) {
		Long userId = null;
		String userName = entity.getActorDisplayName();
		String userRole = entity.getActorRoleName();
		if (entity.getUser() != null) {
			userId = entity.getUser().getId();
			if (userName == null || userName.isBlank()) {
				userName = entity.getUser().getFullName();
			}
			if ((userRole == null || userRole.isBlank()) && entity.getUser().getRole() != null) {
				userRole = entity.getUser().getRole().getName();
			}
		}
		if (userName == null || userName.isBlank()) {
			userName = "Sistema";
		}

		String action = entity.getAction();
		String actionCategory = AuditActionCategory.fromAction(action).name();
		String module = entity.getAffectedTable();

		AuditActorDTO actor = new AuditActorDTO(userId, userName, userRole);
		AuditTargetDTO target = new AuditTargetDTO(module, entity.getRecordId(), module);
		AuditContextDTO context = new AuditContextDTO(entity.getIpAddress(), entity.getUserAgent(), module);
		AuditPayloadDTO payload = new AuditPayloadDTO(entity.getOldValues(), entity.getNewValues());

		return new AuditLogResponseDTO(
				entity.getId(),
				userId,
				userName,
				action,
				actionCategory,
				module,
				entity.getRecordId(),
				entity.getOldValues(),
				entity.getNewValues(),
				entity.getIpAddress(),
				entity.getUserAgent(),
				entity.getLogDate(),
				actor,
				target,
				context,
				payload);
	}
}
