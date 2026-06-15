package com.supermarket.productbatch.mapper;

import org.springframework.stereotype.Component;

import com.supermarket.product.dto.ProductSummaryDTO;
import com.supermarket.productbatch.dto.ProductBatchResponseDTO;
import com.supermarket.productbatch.entity.ProductBatch;

@Component
public class ProductBatchMapper {

	public ProductBatchResponseDTO toResponse(ProductBatch entity) {
		var p = entity.getProduct();
		var productSummary = new ProductSummaryDTO(p.getId(), p.getBarcode(), p.getName());
		return new ProductBatchResponseDTO(
				entity.getId(),
				productSummary,
				entity.getBatchCode(),
				entity.getInitialQuantity(),
				entity.getCurrentQuantity(),
				entity.getEntryDate(),
				entity.getExpirationDate(),
				entity.getCreatedAt(),
				entity.getPurchaseOrderItemId(),
				entity.getWarehouseZone(),
				entity.getQcNotes());
	}
}
