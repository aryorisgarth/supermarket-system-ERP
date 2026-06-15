package com.supermarket.productbatch.dto;

import java.math.BigDecimal;

public record ExpiredWriteOffResultDTO(
		int batchesProcessed,
		BigDecimal totalQuantityWrittenOff) {
}
