package com.supermarket.tax.entity;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
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
@Table(name = "tax_categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TaxCategory {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@NotBlank
	@Size(max = 50)
	@Column(nullable = false, unique = true, length = 50)
	private String name;

	@NotNull
	@DecimalMin(value = "0.0", inclusive = true)
	@Column(nullable = false, precision = 5, scale = 2)
	private BigDecimal percentage;

	@Column(nullable = false)
	private Boolean isActive = true;
}
