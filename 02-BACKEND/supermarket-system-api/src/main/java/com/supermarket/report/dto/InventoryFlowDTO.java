package com.supermarket.report.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record InventoryFlowDTO(
		LocalDate date,
		BigDecimal inputs,
		BigDecimal outputs) {
}
