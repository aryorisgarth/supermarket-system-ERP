package com.supermarket.supplier.entity;

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
@Table(name = "suppliers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Supplier {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@NotBlank
	@Size(max = 100)
	@Column(nullable = false, length = 100)
	private String companyName;

	@Size(max = 100)
	@Column(length = 100)
	private String contactName;

	@Size(max = 20)
	@Column(length = 20)
	private String phone;

	@Email
	@Size(max = 100)
	@Column(length = 100)
	private String email;

	@Column(columnDefinition = "TEXT")
	private String address;

	@Column(name = "created_at", nullable = false, updatable = false)
	private LocalDateTime createdAt;
}
