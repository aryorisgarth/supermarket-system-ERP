package com.supermarket.auth.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.supermarket.auth.entity.RefreshToken;
import com.supermarket.auth.repository.RefreshTokenRepository;
import com.supermarket.user.entity.User;
import com.supermarket.user.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class RefreshTokenServiceTest {

	@Mock
	private RefreshTokenRepository refreshTokenRepository;

	@Mock
	private UserRepository userRepository;

	@InjectMocks
	private RefreshTokenService refreshTokenService;

	private User user;
	private RefreshToken refreshToken;

	@BeforeEach
	void setUp() {
		user = new User();
		user.setId(1L);
		user.setEmail("test@example.com");

		refreshToken = RefreshToken.builder()
				.token("test-token")
				.user(user)
				.expiryDate(LocalDateTime.now().plusDays(7))
				.createdAt(LocalDateTime.now())
				.build();
	}

	@Test
	void createRefreshToken_Success() {
		when(userRepository.findById(1L)).thenReturn(Optional.of(user));
		when(refreshTokenRepository.save(any(RefreshToken.class))).thenReturn(refreshToken);

		RefreshToken result = refreshTokenService.createRefreshToken(1L);

		assertNotNull(result);
		assertEquals("test-token", result.getToken());
		verify(refreshTokenRepository).deleteByUserId(1L);
		verify(refreshTokenRepository).save(any(RefreshToken.class));
	}

	@Test
	void createRefreshToken_UserNotFound() {
		when(userRepository.findById(1L)).thenReturn(Optional.empty());

		assertThrows(RuntimeException.class, () -> refreshTokenService.createRefreshToken(1L));
	}

	@Test
	void findByToken_Success() {
		when(refreshTokenRepository.findByToken("test-token")).thenReturn(Optional.of(refreshToken));

		RefreshToken result = refreshTokenService.findByToken("test-token");

		assertNotNull(result);
		assertEquals("test-token", result.getToken());
	}

	@Test
	void findByToken_NotFound() {
		when(refreshTokenRepository.findByToken("invalid-token")).thenReturn(Optional.empty());

		assertThrows(RuntimeException.class, () -> refreshTokenService.findByToken("invalid-token"));
	}

	@Test
	void verifyExpiration_ValidToken() {
		RefreshToken validToken = RefreshToken.builder()
				.token("valid-token")
				.user(user)
				.expiryDate(LocalDateTime.now().plusDays(1))
				.createdAt(LocalDateTime.now())
				.build();

		RefreshToken result = refreshTokenService.verifyExpiration(validToken);

		assertNotNull(result);
		assertEquals("valid-token", result.getToken());
	}

	@Test
	void verifyExpiration_ExpiredToken() {
		RefreshToken expiredToken = RefreshToken.builder()
				.token("expired-token")
				.user(user)
				.expiryDate(LocalDateTime.now().minusDays(1))
				.createdAt(LocalDateTime.now())
				.build();

		doNothing().when(refreshTokenRepository).delete(expiredToken);

		assertThrows(RuntimeException.class, () -> refreshTokenService.verifyExpiration(expiredToken));
		verify(refreshTokenRepository).delete(expiredToken);
	}

	@Test
	void deleteByUserId_Success() {
		refreshTokenService.deleteByUserId(1L);

		verify(refreshTokenRepository).deleteByUserId(1L);
	}

	@Test
	void deleteExpiredTokens_Success() {
		refreshTokenService.deleteExpiredTokens();

		verify(refreshTokenRepository).deleteExpiredTokens(any(LocalDateTime.class));
	}
}
