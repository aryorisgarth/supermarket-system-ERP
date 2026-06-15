package com.supermarket.promotion.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.supermarket.category.dto.CategorySummaryDTO;
import com.supermarket.product.dto.ProductSummaryDTO;
import com.supermarket.promotion.model.PromotionType;

public record PromotionResponseDTO(
		Long id,
		String name,
		String description,
		PromotionType type,
		BigDecimal value,
		BigDecimal minQuantity,
		ProductSummaryDTO product,
		CategorySummaryDTO category,
		Integer expiryDaysTrigger,
		LocalDate startDate,
		LocalDate endDate,
		Boolean isActive,
		LocalDateTime createdAt) {
}
