package com.supermarket.inventorycount.mapper;

import java.util.List;

import org.springframework.stereotype.Component;

import com.supermarket.inventorycount.dto.InventoryCountLineResponseDTO;
import com.supermarket.inventorycount.dto.InventoryCountSessionResponseDTO;
import com.supermarket.inventorycount.entity.InventoryCountLine;
import com.supermarket.inventorycount.entity.InventoryCountSession;
import com.supermarket.user.dto.UserSummaryDTO;
import com.supermarket.user.entity.User;

@Component
public class InventoryCountMapper {

	public InventoryCountSessionResponseDTO toResponse(InventoryCountSession session) {
		return new InventoryCountSessionResponseDTO(
				session.getId(),
				session.getSessionCode(),
				session.getStatus(),
				session.getNotes(),
				session.getWarehouseZone(),
				toUserSummary(session.getCreatedBy()),
				toUserSummary(session.getApprovedBy()),
				toUserSummary(session.getCountedBy()),
				session.getSubmittedAt(),
				session.getApprovedAt(),
				session.getCreatedAt(),
				session.getUpdatedAt(),
				session.getLines().stream().map(this::toLineResponse).toList());
	}

	public InventoryCountSessionResponseDTO toSummary(InventoryCountSession session) {
		return new InventoryCountSessionResponseDTO(
				session.getId(),
				session.getSessionCode(),
				session.getStatus(),
				session.getNotes(),
				session.getWarehouseZone(),
				toUserSummary(session.getCreatedBy()),
				toUserSummary(session.getApprovedBy()),
				toUserSummary(session.getCountedBy()),
				session.getSubmittedAt(),
				session.getApprovedAt(),
				session.getCreatedAt(),
				session.getUpdatedAt(),
				List.of());
	}

	public InventoryCountLineResponseDTO toLineResponse(InventoryCountLine line) {
		Long uomConversionId = line.getUomConversion() != null ? line.getUomConversion().getId() : null;
		String uomLabel = line.getUomConversion() != null ? line.getUomConversion().getLabel() : "UN";
		java.math.BigDecimal uomFactor = line.getUomConversion() != null
				? line.getUomConversion().getFactor()
				: java.math.BigDecimal.ONE;
		java.math.BigDecimal countedQuantityCommercial = uomFactor.compareTo(java.math.BigDecimal.ONE) == 0
				? line.getCountedQuantity()
				: line.getCountedQuantity().divide(uomFactor, 4, java.math.RoundingMode.HALF_UP);
		Long batchId = line.getBatch() != null ? line.getBatch().getId() : null;
		String batchCode = line.getBatch() != null ? line.getBatch().getBatchCode() : null;
		return new InventoryCountLineResponseDTO(
				line.getId(),
				line.getProduct().getId(),
				line.getBarcode(),
				line.getProduct().getName(),
				line.getSystemQuantity(),
				line.getCountedQuantity(),
				line.getVariance(),
				line.getNotes(),
				uomConversionId,
				uomLabel,
				uomFactor,
				countedQuantityCommercial,
				batchId,
				batchCode);
	}

	private UserSummaryDTO toUserSummary(User user) {
		if (user == null) {
			return null;
		}
		return new UserSummaryDTO(user.getId(), user.getFullName(), user.getEmail());
	}
}
