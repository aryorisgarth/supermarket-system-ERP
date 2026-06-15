package com.supermarket.supplier.dto;

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
public class SupplierRequestDTO {

	@NotBlank
	@Size(max = 100)
	private String companyName;

	@Size(max = 100)
	private String contactName;

	@Size(max = 20)
	private String phone;

	@Email
	@Size(max = 100)
	private String email;

	private String address;
}
