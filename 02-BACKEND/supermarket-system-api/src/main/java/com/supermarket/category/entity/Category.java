package com.supermarket.category.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Category {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(columnDefinition = "SMALLINT")
	private Short id;

	@NotBlank
	@Size(max = 50)
	@Column(nullable = false, length = 50, unique = true)
	private String name;

	@Size(max = 255)
	@Column(length = 255)
	private String description;

	@Column(name = "default_requires_batch", nullable = false)
	private Boolean defaultRequiresBatch = false;

	@Column(name = "default_requires_expiration", nullable = false)
	private Boolean defaultRequiresExpiration = false;
}
