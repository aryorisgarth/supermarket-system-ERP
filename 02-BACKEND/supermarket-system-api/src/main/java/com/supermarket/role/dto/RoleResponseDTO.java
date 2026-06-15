package com.supermarket.role.dto;

import java.util.List;

public record RoleResponseDTO(Byte id, String name, String description, List<String> permissions) {
}
