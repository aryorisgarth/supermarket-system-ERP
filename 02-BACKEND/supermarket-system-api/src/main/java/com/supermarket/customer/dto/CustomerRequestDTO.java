package com.supermarket.customer.dto;

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
public class CustomerRequestDTO {

	@NotBlank
	@Size(max = 100)
	private String fullName;

	@Size(max = 20)
	private String documentId;

	@Size(max = 20)
	private String phone;

	@Email
	@Size(max = 100)
	private String email;

	private String address;
}
