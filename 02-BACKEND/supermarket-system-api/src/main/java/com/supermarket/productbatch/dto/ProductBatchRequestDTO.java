package com.supermarket.productbatch.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductBatchRequestDTO {

	@NotNull
	private Long productId;

	@NotBlank
	@Size(max = 50)
	private String batchCode;

	@NotNull
	@DecimalMin(value = "0.0", inclusive = false)
	private BigDecimal initialQuantity;

	@NotNull
	private LocalDate entryDate;

	@NotNull
	private LocalDate expirationDate;
}
