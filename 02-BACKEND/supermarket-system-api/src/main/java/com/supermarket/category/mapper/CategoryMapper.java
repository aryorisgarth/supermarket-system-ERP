package com.supermarket.category.mapper;

import org.springframework.stereotype.Component;

import com.supermarket.category.dto.CategoryRequestDTO;
import com.supermarket.category.dto.CategoryResponseDTO;
import com.supermarket.category.entity.Category;

@Component
public class CategoryMapper {

	public Category toEntity(CategoryRequestDTO dto) {
		Category category = new Category();
		apply(category, dto);
		return category;
	}

	public CategoryResponseDTO toResponse(Category entity) {
		return new CategoryResponseDTO(
			entity.getId(),
			entity.getName(),
			entity.getDescription(),
			entity.getDefaultRequiresBatch(),
			entity.getDefaultRequiresExpiration()
		);
	}

	public void apply(Category entity, CategoryRequestDTO dto) {
		entity.setName(dto.getName());
		entity.setDescription(dto.getDescription());
		entity.setDefaultRequiresBatch(dto.getDefaultRequiresBatch() != null ? dto.getDefaultRequiresBatch() : false);
		entity.setDefaultRequiresExpiration(dto.getDefaultRequiresExpiration() != null ? dto.getDefaultRequiresExpiration() : false);
	}
}
