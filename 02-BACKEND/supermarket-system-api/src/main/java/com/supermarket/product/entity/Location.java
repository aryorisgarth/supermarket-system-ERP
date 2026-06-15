package com.supermarket.product.entity;

import java.time.LocalDateTime;
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
@Table(name = "locations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Location {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@NotBlank
	@Size(max = 100)
	@Column(nullable = false, length = 100)
	private String warehouse;

	@Size(max = 50)
	@Column(length = 50)
	private String aisle;

	@Size(max = 50)
	@Column(length = 50)
	private String shelf;

	@Size(max = 50)
	@Column(length = 50)
	private String level;

	@NotBlank
	@Size(max = 100)
	@Column(name = "location_code", nullable = false, length = 100, unique = true)
	private String locationCode;

	@Column(name = "is_piso_venta", nullable = false)
	private Boolean isPisoVenta = false;

	@Column(name = "created_at", nullable = false, updatable = false)
	private LocalDateTime createdAt = LocalDateTime.now();

	@Column(name = "updated_at", nullable = false)
	private LocalDateTime updatedAt = LocalDateTime.now();
}
