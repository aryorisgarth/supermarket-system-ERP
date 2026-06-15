package com.supermarket.role.dto;

import java.util.List;

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
public class RoleRequestDTO {

	@NotBlank
	@Size(max = 30)
	private String name;

	@Size(max = 255)
	private String description;

	private List<String> permissions;
}
