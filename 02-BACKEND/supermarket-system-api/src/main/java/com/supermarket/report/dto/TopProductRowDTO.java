package com.supermarket.report.dto;

import java.math.BigDecimal;

public record TopProductRowDTO(
		Long productId,
		String productName,
		BigDecimal quantitySold,
		BigDecimal revenue) {
}
