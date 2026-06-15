package com.supermarket.user.dto;

import jakarta.validation.constraints.Email;
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
public class UserRequestDTO {

	@NotBlank
	@Size(max = 100)
	private String fullName;

	@NotBlank
	@Size(max = 100)
	private String lastName;

	@NotBlank
	@Email
	@Size(max = 100)
	private String email;

	private String password;

	private Boolean isActive = true;

	@NotBlank
	private String roleName;
}
