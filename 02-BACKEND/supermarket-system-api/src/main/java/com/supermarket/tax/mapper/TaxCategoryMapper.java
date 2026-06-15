package com.supermarket.tax.mapper;

import org.springframework.stereotype.Component;

import com.supermarket.tax.dto.TaxCategoryRequestDTO;
import com.supermarket.tax.dto.TaxCategoryResponseDTO;
import com.supermarket.tax.entity.TaxCategory;

@Component
public class TaxCategoryMapper {

	public TaxCategoryResponseDTO toResponse(TaxCategory entity) {
		if (entity == null) return null;
		return new TaxCategoryResponseDTO(
				entity.getId(),
				entity.getName(),
				entity.getPercentage(),
				entity.getIsActive()
		);
	}

	public void updateEntity(TaxCategory entity, TaxCategoryRequestDTO dto) {
		entity.setName(dto.name());
		entity.setPercentage(dto.percentage());
		if (dto.isActive() != null) {
			entity.setIsActive(dto.isActive());
		}
	}
}
