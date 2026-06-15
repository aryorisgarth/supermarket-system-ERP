package com.supermarket.cashregister.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.supermarket.cashregister.model.CashMovementType;
import com.supermarket.user.entity.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "cash_register_movements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CashRegisterMovement {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "session_id", nullable = false)
	private CashRegisterSession session;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@NotNull
	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private CashMovementType type;

	@NotNull
	@DecimalMin(value = "0.0", inclusive = false)
	@Column(nullable = false, precision = 12, scale = 4)
	private BigDecimal amount;

	@NotBlank
	@Size(max = 255)
	@Column(nullable = false, length = 255)
	private String reason;

	@Column(name = "created_at", nullable = false, updatable = false)
	private LocalDateTime createdAt;
}
