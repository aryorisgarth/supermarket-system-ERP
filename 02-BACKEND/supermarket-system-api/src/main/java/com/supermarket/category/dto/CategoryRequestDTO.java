package com.supermarket.category.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CategoryRequestDTO {

	@NotBlank
	@Size(max = 50)
	private String name;

	@Size(max = 255)
	private String description;

	private Boolean defaultRequiresBatch = false;

	private Boolean defaultRequiresExpiration = false;
}
