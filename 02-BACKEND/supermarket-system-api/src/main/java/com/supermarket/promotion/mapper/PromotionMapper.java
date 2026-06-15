package com.supermarket.promotion.mapper;

import org.springframework.stereotype.Component;

import com.supermarket.category.dto.CategorySummaryDTO;
import com.supermarket.product.dto.ProductSummaryDTO;
import com.supermarket.promotion.dto.PromotionResponseDTO;
import com.supermarket.promotion.entity.Promotion;

@Component
public class PromotionMapper {

	public PromotionResponseDTO toResponse(Promotion p) {
		ProductSummaryDTO productDto = null;
		if (p.getProduct() != null) {
			var prod = p.getProduct();
			productDto = new ProductSummaryDTO(prod.getId(), prod.getBarcode(), prod.getName());
		}
		CategorySummaryDTO categoryDto = null;
		if (p.getCategory() != null) {
			var cat = p.getCategory();
			categoryDto = new CategorySummaryDTO(cat.getId(), cat.getName());
		}
		return new PromotionResponseDTO(
				p.getId(),
				p.getName(),
				p.getDescription(),
				p.getType(),
				p.getValue(),
				p.getMinQuantity(),
				productDto,
				categoryDto,
				p.getExpiryDaysTrigger(),
				p.getStartDate(),
				p.getEndDate(),
				p.getIsActive(),
				p.getCreatedAt());
	}
}
