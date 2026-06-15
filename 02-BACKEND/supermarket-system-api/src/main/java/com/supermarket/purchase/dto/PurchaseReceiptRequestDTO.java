package com.supermarket.purchase.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PurchaseReceiptRequestDTO {

	@Size(max = 255)
	private String notes;

	@Valid
	@NotEmpty
	private List<PurchaseReceiptItemRequestDTO> items;
}
