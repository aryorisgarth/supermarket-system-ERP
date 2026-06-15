package com.supermarket.security;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;

import javax.crypto.SecretKey;

import org.springframework.stereotype.Service;

import com.supermarket.config.JwtProperties;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class JwtService {

	private final JwtProperties jwtProperties;

	private SecretKey signingKey() {
		return Keys.hmacShaKeyFor(jwtProperties.secret().getBytes(StandardCharsets.UTF_8));
	}

	public String createToken(Long userId, String email, String roleName) {
		return createToken(userId, email, roleName, List.of());
	}

	public String createToken(Long userId, String email, String roleName, List<String> permissions) {
		long expMs = jwtProperties.expirationMs();
		Date now = new Date();
		Date exp = new Date(now.getTime() + expMs);
		return Jwts.builder()
				.subject(email)
				.claim("uid", userId)
				.claim("role", roleName)
				.claim("permissions", permissions)
				.issuedAt(now)
				.expiration(exp)
				.signWith(signingKey())
				.compact();
	}

	public Claims parseAndValidate(String token) {
		return Jwts.parser()
				.verifyWith(signingKey())
				.build()
				.parseSignedClaims(token)
				.getPayload();
	}
}
