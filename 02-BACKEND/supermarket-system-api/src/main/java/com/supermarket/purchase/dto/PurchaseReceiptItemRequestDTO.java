package com.supermarket.purchase.dto;



import java.math.BigDecimal;

import java.time.LocalDate;



import jakarta.validation.constraints.DecimalMin;

import jakarta.validation.constraints.NotNull;

import jakarta.validation.constraints.Size;

import lombok.Getter;

import lombok.Setter;



@Getter

@Setter

public class PurchaseReceiptItemRequestDTO {



	@NotNull

	private Long itemId;



	@NotNull

	@DecimalMin(value = "0.0", inclusive = false)

	private BigDecimal quantityReceived;



	@DecimalMin(value = "0.0", inclusive = true)

	private BigDecimal quantityRejected;



	@Size(max = 50)

	private String batchCode;



	private LocalDate expirationDate;



	@Size(max = 80)

	private String warehouseZone;



	@Size(max = 500)

	private String qcNotes;

}

