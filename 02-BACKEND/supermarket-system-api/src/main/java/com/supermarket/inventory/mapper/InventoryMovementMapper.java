package com.supermarket.inventory.mapper;

import org.springframework.stereotype.Component;

import com.supermarket.inventory.dto.InventoryMovementResponseDTO;
import com.supermarket.inventory.entity.InventoryMovement;
import com.supermarket.product.dto.ProductSummaryDTO;
import com.supermarket.user.dto.UserSummaryDTO;

@Component
public class InventoryMovementMapper {

	public InventoryMovementResponseDTO toResponse(InventoryMovement entity) {
		var p = entity.getProduct();
		var productDto = new ProductSummaryDTO(p.getId(), p.getBarcode(), p.getName());
		Long batchId = null;
		String batchCode = null;
		if (entity.getBatch() != null) {
			batchId = entity.getBatch().getId();
			batchCode = entity.getBatch().getBatchCode();
		}
		var u = entity.getUser();
		var userDto = new UserSummaryDTO(u.getId(), u.getFullName(), u.getEmail());
		return new InventoryMovementResponseDTO(
				entity.getId(),
				productDto,
				batchId,
				batchCode,
				userDto,
				entity.getMovementType(),
				entity.getQuantity(),
				entity.getFactor(),
				entity.getReferenceId(),
				entity.getPreviousStock(),
				entity.getNewStock(),
				entity.getUnitCost(),
				entity.getTotalCost(),
				entity.getSourceType(),
				entity.getReferenceLineId(),
				entity.getNotes(),
				entity.getCreatedAt());
	}
}
