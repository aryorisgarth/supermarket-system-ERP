package com.supermarket.inventorycount.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.supermarket.inventorycount.dto.InventoryCountScanRequestDTO;
import com.supermarket.inventorycount.dto.InventoryCountSessionRequestDTO;
import com.supermarket.inventorycount.dto.InventoryCountSessionResponseDTO;
import com.supermarket.inventorycount.model.InventoryCountStatus;

public interface InventoryCountService {

	Page<InventoryCountSessionResponseDTO> findPage(InventoryCountStatus status, Pageable pageable);

	InventoryCountSessionResponseDTO findById(Long id);

	InventoryCountSessionResponseDTO create(InventoryCountSessionRequestDTO request);

	InventoryCountSessionResponseDTO scan(Long sessionId, InventoryCountScanRequestDTO request);

	InventoryCountSessionResponseDTO submit(Long sessionId);

	InventoryCountSessionResponseDTO approve(Long sessionId);

	InventoryCountSessionResponseDTO cancel(Long sessionId);

	InventoryCountSessionResponseDTO claim(Long id);

	InventoryCountSessionResponseDTO assign(Long id, Long userId);
}
