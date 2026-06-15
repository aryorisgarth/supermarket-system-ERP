package com.supermarket.customer.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "customers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Customer {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@NotBlank
	@Size(max = 100)
	@Column(nullable = false, length = 100)
	private String fullName;

	@Size(max = 20)
	@Column(length = 20, unique = true)
	private String documentId;

	@Size(max = 20)
	@Column(length = 20)
	private String phone;

	@Email
	@Size(max = 100)
	@Column(length = 100)
	private String email;

	@Column(columnDefinition = "TEXT")
	private String address;

	@Column(nullable = false)
	private Integer points = 0;

	@Column(name = "created_at", nullable = false, updatable = false)
	private LocalDateTime createdAt;
}
