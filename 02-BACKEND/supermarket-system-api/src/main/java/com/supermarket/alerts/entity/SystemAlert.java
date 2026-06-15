package com.supermarket.alerts.entity;

import java.time.LocalDateTime;

import com.supermarket.user.entity.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "system_alerts")
@Getter
@Setter
public class SystemAlert {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "alert_key", nullable = false, unique = true, length = 160)
	private String alertKey;

	@Column(nullable = false, length = 40)
	private String type;

	@Column(nullable = false, length = 20)
	private String severity;

	@Column(nullable = false, length = 20)
	private String status;

	@Column(nullable = false, length = 120)
	private String title;

	@Column(nullable = false, length = 500)
	private String message;

	@Column(name = "source_module", length = 60)
	private String sourceModule;

	@Column(name = "reference_id")
	private Long referenceId;

	@Column(name = "action_path", length = 120)
	private String actionPath;

	@Column(name = "created_at", nullable = false)
	private LocalDateTime createdAt;

	@Column(name = "updated_at", nullable = false)
	private LocalDateTime updatedAt;

	@Column(name = "resolved_at")
	private LocalDateTime resolvedAt;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "resolved_by_id")
	private User resolvedBy;
}
