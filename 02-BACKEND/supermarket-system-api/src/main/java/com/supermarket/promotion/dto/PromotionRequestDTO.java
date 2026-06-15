package com.supermarket.promotion.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import com.supermarket.promotion.model.PromotionType;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PromotionRequestDTO {

	@NotBlank
	@Size(max = 120)
	private String name;

	@Size(max = 500)
	private String description;

	@NotNull
	private PromotionType type;

	@NotNull
	@DecimalMin(value = "0.0", inclusive = false)
	private BigDecimal value;

	@DecimalMin(value = "0.0", inclusive = false)
	private BigDecimal minQuantity;

	private Long productId;
	private Long categoryId;

	
	private Integer expiryDaysTrigger;

	@NotNull
	private LocalDate startDate;

	@NotNull
	private LocalDate endDate;

	private Boolean isActive;
}
