package com.supermarket.audit.mapper;

import org.springframework.stereotype.Component;

import com.supermarket.audit.dto.AuditLogResponseDTO;
import com.supermarket.audit.entity.AuditLog;

@Component
public class AuditLogMapper {

	public AuditLogResponseDTO toResponse(AuditLog entity) {
		Long userId = null;
		String userName = null;
		if (entity.getUser() != null) {
			userId = entity.getUser().getId();
			userName = entity.getUser().getFullName();
		}
		return new AuditLogResponseDTO(
				entity.getId(),
				userId,
				userName,
				entity.getAction(),
				entity.getAffectedTable(),
				entity.getRecordId(),
				entity.getOldValues(),
				entity.getNewValues(),
				entity.getIpAddress(),
				entity.getLogDate());
	}
}
