package com.supermarket.auth.dto;

import com.supermarket.user.dto.UserResponseDTO;

public record LoginResponseDTO(
		String accessToken,
		String refreshToken,
		String tokenType,
		long expiresInMs,
		UserResponseDTO user) {
}
