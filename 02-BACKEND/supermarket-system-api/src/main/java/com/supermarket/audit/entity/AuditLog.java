package com.supermarket.audit.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.supermarket.user.entity.User;

@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", foreignKey = @jakarta.persistence.ForeignKey(name = "fk_audit_user"))
	private User user;

	@Size(max = 50)
	@Column(length = 50)
	private String action;

	@Size(max = 50)
	@Column(name = "affected_table", length = 50)
	private String affectedTable;

	@Column(name = "record_id")
	private Long recordId;

	@Column(name = "old_values", columnDefinition = "TEXT")
	private String oldValues;

	@Column(name = "new_values", columnDefinition = "TEXT")
	private String newValues;

	@Size(max = 45)
	@Column(name = "ip_address", length = 45)
	private String ipAddress;

	@Column(name = "log_date", nullable = false, updatable = false)
	private LocalDateTime logDate;
}
