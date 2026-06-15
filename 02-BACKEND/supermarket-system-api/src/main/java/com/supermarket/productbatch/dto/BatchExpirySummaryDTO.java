package com.supermarket.productbatch.dto;

import java.util.List;

public record BatchExpirySummaryDTO(
		long expiredCount,
		long within7Count,
		long within15Count,
		long within30Count,
		List<ProductBatchResponseDTO> expired,
		List<ProductBatchResponseDTO> expiringSoon) {
}
