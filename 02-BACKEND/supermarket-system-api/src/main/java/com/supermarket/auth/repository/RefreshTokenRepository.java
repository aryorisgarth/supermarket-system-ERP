package com.supermarket.auth.repository;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.supermarket.auth.entity.RefreshToken;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, String> {

	Optional<RefreshToken> findByToken(String token);

	@Modifying
	@Query("DELETE FROM RefreshToken rt WHERE rt.user.id = :userId")
	void deleteByUserId(@Param("userId") Long userId);

	@Modifying
	@Query("DELETE FROM RefreshToken rt WHERE rt.expiryDate < :date")
	void deleteExpiredTokens(@Param("date") LocalDateTime date);
}
