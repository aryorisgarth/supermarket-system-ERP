package com.supermarket.inventory.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.supermarket.inventory.dto.InventoryMovementRequestDTO;
import com.supermarket.inventory.dto.InventoryMovementResponseDTO;
import com.supermarket.inventory.model.InventoryMovementType;

public interface InventoryMovementService {

	Page<InventoryMovementResponseDTO> findAll(Pageable pageable);

	List<InventoryMovementResponseDTO> findByProductId(Long productId);

	List<InventoryMovementResponseDTO> findBetween(LocalDateTime from, LocalDateTime to);

	InventoryMovementResponseDTO create(InventoryMovementRequestDTO request);
}
