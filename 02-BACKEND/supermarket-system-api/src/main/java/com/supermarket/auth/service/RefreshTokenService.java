package com.supermarket.auth.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.supermarket.auth.entity.RefreshToken;
import com.supermarket.auth.repository.RefreshTokenRepository;
import com.supermarket.user.entity.User;
import com.supermarket.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

	private final RefreshTokenRepository refreshTokenRepository;
	private final UserRepository userRepository;

	private static final long REFRESH_TOKEN_EXPIRATION_DAYS = 7;

	@Transactional
	public RefreshToken createRefreshToken(Long userId) {
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new RuntimeException("User not found"));

		
		refreshTokenRepository.deleteByUserId(userId);

		String token = UUID.randomUUID().toString();
		LocalDateTime expiryDate = LocalDateTime.now().plusDays(REFRESH_TOKEN_EXPIRATION_DAYS);

		RefreshToken refreshToken = RefreshToken.builder()
				.token(token)
				.user(user)
				.expiryDate(expiryDate)
				.createdAt(LocalDateTime.now())
				.build();

		return refreshTokenRepository.save(refreshToken);
	}

	public RefreshToken findByToken(String token) {
		return refreshTokenRepository.findByToken(token)
				.orElseThrow(() -> new RuntimeException("Invalid refresh token"));
	}

	@Transactional
	public RefreshToken verifyExpiration(RefreshToken token) {
		if (token.isExpired()) {
			refreshTokenRepository.delete(token);
			throw new RuntimeException("Refresh token was expired. Please make a new login request");
		}
		return token;
	}

	@Transactional
	public void deleteByUserId(Long userId) {
		refreshTokenRepository.deleteByUserId(userId);
	}

	@Transactional
	public void deleteExpiredTokens() {
		refreshTokenRepository.deleteExpiredTokens(LocalDateTime.now());
	}
}
