package com.supermarket.auth.service;

import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.supermarket.auth.dto.LoginRequestDTO;
import com.supermarket.auth.dto.LoginResponseDTO;
import com.supermarket.auth.entity.RefreshToken;
import com.supermarket.config.JwtProperties;
import com.supermarket.security.JwtService;
import com.supermarket.permission.repository.PermissionRepository;
import com.supermarket.user.entity.User;
import com.supermarket.user.mapper.UserMapper;
import com.supermarket.user.repository.UserRepository;
import com.supermarket.user.service.KeycloakAdminService;
import org.springframework.beans.factory.annotation.Value;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

	private final AuthenticationManager authenticationManager;
	private final UserRepository userRepository;
	private final JwtService jwtService;
	private final JwtProperties jwtProperties;
	private final UserMapper userMapper;
	private final RefreshTokenService refreshTokenService;
	private final PermissionRepository permissionRepository;
	private final PasswordEncoder passwordEncoder;
	private final KeycloakAdminService keycloakAdminService;

	@Value("${app.keycloak.client-id:supermarket-app}")
	private String clientId;

	@Value("${app.keycloak.redirect-uri:http://localhost:5173/login}")
	private String redirectUri;

	@Transactional
	public LoginResponseDTO login(LoginRequestDTO request) {
		String email = request.email().trim().toLowerCase();
		try {
			authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, request.password()));
		} catch (DisabledException ex) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User account is disabled");
		} catch (BadCredentialsException ex) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
		}

		User user = userRepository.findByEmailWithRole(email)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));
		user.setLastLogin(LocalDateTime.now());

		var permissions = permissionRepository.findCodesByRoleId(user.getRole().getId());
		String accessToken = jwtService.createToken(user.getId(), user.getEmail(), user.getRole().getName(), permissions);
		RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

		return new LoginResponseDTO(accessToken, refreshToken.getToken(), "Bearer", jwtProperties.expirationMs(), userMapper.toResponse(user));
	}

	@Transactional
	public LoginResponseDTO refreshToken(String refreshToken) {
		RefreshToken token = refreshTokenService.findByToken(refreshToken);
		RefreshToken verifiedToken = refreshTokenService.verifyExpiration(token);
		
		User user = verifiedToken.getUser();
		var permissions = permissionRepository.findCodesByRoleId(user.getRole().getId());
		String newAccessToken = jwtService.createToken(user.getId(), user.getEmail(), user.getRole().getName(), permissions);
		
		return new LoginResponseDTO(newAccessToken, verifiedToken.getToken(), "Bearer", jwtProperties.expirationMs(), userMapper.toResponse(user));
	}

	@Transactional
	public void logout(Long userId) {
		refreshTokenService.deleteByUserId(userId);
	}

	@Transactional
	public void changePassword(String email, String currentPassword, String newPassword) {
		String normalizedEmail = email.trim().toLowerCase();
		User user = userRepository.findByEmailWithRole(normalizedEmail)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

		if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La contraseña actual es incorrecta");
		}
		if (currentPassword.equals(newPassword)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La nueva contraseña debe ser diferente a la actual");
		}

		user.setPassword(passwordEncoder.encode(newPassword));
		userRepository.save(user);
	}

	@Transactional(readOnly = true)
	public void forgotPassword(String email) {
		String normalizedEmail = email.trim().toLowerCase();
		if (!userRepository.existsByEmail(normalizedEmail)) {
			return;
		}
		keycloakAdminService.findUserIdByEmail(normalizedEmail).ifPresent(userId ->
				keycloakAdminService.triggerPasswordReset(userId, clientId, redirectUri)
		);
	}
}
