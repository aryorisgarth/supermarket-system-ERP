package com.supermarket.billing.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class PaymentAccountRequestDTO {

	@NotBlank
	@Size(max = 100)
	private String name;

	@NotBlank
	@Size(max = 100)
	private String bankName;

	@NotBlank
	@Size(max = 120)
	private String accountHolder;

	@Size(max = 60)
	private String accountNumber;

	@NotBlank
	@Size(max = 30)
	private String accountType;

	@NotBlank
	@Size(min = 3, max = 3)
	private String currency = "GTQ";

	@Size(max = 30)
	private String taxId;

	@NotBlank
	@Size(max = 40)
	private String gatewayProvider = "MOCK";

	@Size(max = 80)
	private String merchantId;

	@Size(max = 80)
	private String terminalId;

	@NotNull
	@DecimalMin("0.0")
	private BigDecimal commissionPercentage = BigDecimal.ZERO;

	@NotNull
	@Min(0)
	private Integer settlementDays = 2;

	private Boolean isDefault = false;

	private Boolean isActive = true;
}
