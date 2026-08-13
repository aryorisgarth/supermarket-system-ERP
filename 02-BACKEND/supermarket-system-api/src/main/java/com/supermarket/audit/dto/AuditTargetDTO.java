package com.supermarket.audit.dto;

public record AuditTargetDTO(String entity, Long id, String module) {
}
