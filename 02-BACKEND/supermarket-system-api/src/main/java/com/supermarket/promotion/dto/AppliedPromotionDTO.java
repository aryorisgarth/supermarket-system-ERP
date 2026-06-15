package com.supermarket.promotion.dto;

import java.math.BigDecimal;

import com.supermarket.promotion.model.PromotionType;


public record AppliedPromotionDTO(
		Long promotionId,
		String promotionName,
		PromotionType type,
		BigDecimal discountAmount,
		String displayLabel) {
}
