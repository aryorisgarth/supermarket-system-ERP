package com.supermarket.alerts.entity;

import java.time.LocalDateTime;

import com.supermarket.role.entity.Role;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "notification_rules")
@Getter
@Setter
public class NotificationRule {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "alert_type", nullable = false, length = 60)
	private String alertType;

	@Column(nullable = false, length = 20)
	private String severity;

	@Column(nullable = false, length = 20)
	private String channel;

	@ManyToOne
	@JoinColumn(name = "role_id", nullable = false)
	private Role role;

	@Column(name = "is_active", nullable = false)
	private Boolean isActive = true;

	@Column(name = "created_at", nullable = false)
	private LocalDateTime createdAt;

	@Column(name = "updated_at", nullable = false)
	private LocalDateTime updatedAt;
}
