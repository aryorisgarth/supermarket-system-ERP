package com.supermarket.user.entity;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.supermarket.role.entity.Role;
import com.supermarket.permission.entity.Permission;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@NotBlank
	@Size(max = 100)
	@Column(nullable = false, length = 100)
	private String fullName;

	@NotBlank
	@Email
	@Size(max = 100)
	@Column(nullable = false, length = 100, unique = true)
	private String email;

	@NotBlank
	@Size(min = 8)
	@Column(nullable = false)
	private String password;

	@Column(nullable = false)
	private Boolean isActive = true;

	@Column(name = "is_system", nullable = false)
	private Boolean isSystem = false;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "role_id", nullable = false, foreignKey = @jakarta.persistence.ForeignKey(name = "fk_users_roles"))
	private Role role;

	@ManyToMany
	@JoinTable(
			name = "user_permissions",
			joinColumns = @JoinColumn(name = "user_id"),
			inverseJoinColumns = @JoinColumn(name = "permission_id"))
	private Set<Permission> directPermissions = new HashSet<>();

	@Column(name = "last_login")
	private LocalDateTime lastLogin;

	@Column(name = "created_at", nullable = false, updatable = false)
	private LocalDateTime createdAt;
}
