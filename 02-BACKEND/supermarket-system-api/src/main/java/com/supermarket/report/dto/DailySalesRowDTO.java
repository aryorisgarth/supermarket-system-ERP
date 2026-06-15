package com.supermarket.report.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DailySalesRowDTO(
		LocalDate day,
		BigDecimal total) {
}
