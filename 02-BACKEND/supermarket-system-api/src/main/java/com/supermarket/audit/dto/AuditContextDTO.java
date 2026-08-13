package com.supermarket.audit.dto;

public record AuditContextDTO(String ipAddress, String userAgent, String module) {
}
