package com.supermarket.purchase.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.supermarket.purchase.dto.PurchaseOrderRequestDTO;
import com.supermarket.purchase.dto.PurchaseOrderResponseDTO;
import com.supermarket.purchase.dto.PurchaseReceiptRequestDTO;
import com.supermarket.purchase.model.PurchaseOrderStatus;

public interface PurchaseOrderService {

	List<PurchaseOrderResponseDTO> findAll(PurchaseOrderStatus status);

	Page<PurchaseOrderResponseDTO> findPage(PurchaseOrderStatus status, Long supplierId, String search, Pageable pageable);

	PurchaseOrderResponseDTO findById(Long id);

	PurchaseOrderResponseDTO create(PurchaseOrderRequestDTO request);

	PurchaseOrderResponseDTO markOrdered(Long id);

	PurchaseOrderResponseDTO receive(Long id);

	PurchaseOrderResponseDTO receive(Long id, PurchaseReceiptRequestDTO request);

	PurchaseOrderResponseDTO claim(Long id);

	PurchaseOrderResponseDTO assign(Long id, Long userId);

	PurchaseOrderResponseDTO cancel(Long id);
}
