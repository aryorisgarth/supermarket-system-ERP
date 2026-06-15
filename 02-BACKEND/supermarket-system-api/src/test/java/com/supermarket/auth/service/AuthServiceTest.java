package com.supermarket.auth.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import com.supermarket.auth.dto.LoginRequestDTO;
import com.supermarket.auth.dto.LoginResponseDTO;
import com.supermarket.auth.entity.RefreshToken;
import com.supermarket.config.JwtProperties;
import com.supermarket.permission.repository.PermissionRepository;
import com.supermarket.security.JwtService;
import com.supermarket.user.entity.User;
import com.supermarket.role.entity.Role;
import com.supermarket.user.mapper.UserMapper;
import com.supermarket.user.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

	@Mock
	private AuthenticationManager authenticationManager;

	@Mock
	private UserRepository userRepository;

	@Mock
	private JwtService jwtService;

	@Mock
	private JwtProperties jwtProperties;

	@Mock
	private UserMapper userMapper;

	@Mock
	private RefreshTokenService refreshTokenService;

	@Mock
	private PermissionRepository permissionRepository;

	@Mock
	private PasswordEncoder passwordEncoder;

	@InjectMocks
	private AuthService authService;

	private User user;
	private Role role;
	private RefreshToken refreshToken;

	@BeforeEach
	void setUp() {
		role = new Role();
		role.setId((byte) 1);
		role.setName("ADMINISTRADOR");

		user = new User();
		user.setId(1L);
		user.setEmail("admin@example.com");
		user.setPassword("encodedPassword");
		user.setRole(role);
		user.setLastLogin(LocalDateTime.now());

		refreshToken = RefreshToken.builder()
				.token("refresh-token")
				.user(user)
				.expiryDate(LocalDateTime.now().plusDays(7))
				.createdAt(LocalDateTime.now())
				.build();
	}

	@Test
	void login_Success() {
		LoginRequestDTO request = new LoginRequestDTO("admin@example.com", "password");
		when(userRepository.findByEmailWithRole("admin@example.com")).thenReturn(Optional.of(user));
		when(permissionRepository.findCodesByRoleId((byte) 1)).thenReturn(List.of("users:read"));
		when(jwtService.createToken(eq(1L), eq("admin@example.com"), eq("ADMINISTRADOR"), anyList())).thenReturn("jwt-token");
		when(refreshTokenService.createRefreshToken(1L)).thenReturn(refreshToken);
		when(jwtProperties.expirationMs()).thenReturn(86400000L);
		when(userMapper.toResponse(user)).thenReturn(any());

		LoginResponseDTO response = authService.login(request);

		assertNotNull(response);
		assertEquals("jwt-token", response.accessToken());
		assertEquals("refresh-token", response.refreshToken());
		assertEquals("Bearer", response.tokenType());
		verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
		verify(userRepository).findByEmailWithRole("admin@example.com");
	}

	@Test
	void login_BadCredentials() {
		LoginRequestDTO request = new LoginRequestDTO("admin@example.com", "wrongPassword");
		doThrow(new BadCredentialsException("Bad credentials"))
				.when(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));

		assertThrows(ResponseStatusException.class, () -> authService.login(request));
	}

	@Test
	void login_UserNotFound() {
		LoginRequestDTO request = new LoginRequestDTO("admin@example.com", "password");
		when(userRepository.findByEmailWithRole("admin@example.com")).thenReturn(Optional.empty());

		assertThrows(ResponseStatusException.class, () -> authService.login(request));
	}

	@Test
	void refreshToken_Success() {
		when(refreshTokenService.findByToken("refresh-token")).thenReturn(refreshToken);
		when(refreshTokenService.verifyExpiration(refreshToken)).thenReturn(refreshToken);
		when(permissionRepository.findCodesByRoleId((byte) 1)).thenReturn(List.of("users:read"));
		when(jwtService.createToken(eq(1L), eq("admin@example.com"), eq("ADMINISTRADOR"), anyList())).thenReturn("new-jwt-token");
		when(jwtProperties.expirationMs()).thenReturn(86400000L);
		when(userMapper.toResponse(user)).thenReturn(any());

		LoginResponseDTO response = authService.refreshToken("refresh-token");

		assertNotNull(response);
		assertEquals("new-jwt-token", response.accessToken());
		assertEquals("refresh-token", response.refreshToken());
	}

	@Test
	void refreshToken_InvalidToken() {
		when(refreshTokenService.findByToken("invalid-token")).thenThrow(new RuntimeException("Invalid refresh token"));

		assertThrows(RuntimeException.class, () -> authService.refreshToken("invalid-token"));
	}

	@Test
	void logout_Success() {
		authService.logout(1L);

		verify(refreshTokenService).deleteByUserId(1L);
	}
}
