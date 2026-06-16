package com.supermarket.customer.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
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
	@Pattern(regexp = "^[A-Za-záéíóúÁÉÍÓÚñÑ\\s.'-]+$", message = "El nombre contiene caracteres inválidos. Solo se permiten letras, espacios, puntos, guiones y apóstrofes.")
	private String fullName;

	@Size(max = 20)
	@Pattern(regexp = "^[A-Za-z0-9\\-]+$", message = "El documento de identidad solo puede contener letras, números y guiones.")
	private String documentId;

	@Size(max = 20)
	@Pattern(regexp = "^\\+?[0-9\\s\\-]+$", message = "El teléfono contiene caracteres inválidos. Solo se permiten números, espacios, guiones y un prefijo + opcional.")
	private String phone;

	@Email
	@Size(max = 100)
	private String email;

	private String address;
}
