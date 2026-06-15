package com.supermarket.auth.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "refresh_tokens")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefreshToken {

	@Id
	@Column(name = "token", length = 500)
	private String token;

	@ManyToOne
	@JoinColumn(name = "user_id", nullable = false)
	private com.supermarket.user.entity.User user;

	@Column(name = "expiry_date", nullable = false)
	private LocalDateTime expiryDate;

	@Column(name = "created_at", nullable = false)
	private LocalDateTime createdAt;

	public boolean isExpired() {
		return LocalDateTime.now().isAfter(expiryDate);
	}
}
