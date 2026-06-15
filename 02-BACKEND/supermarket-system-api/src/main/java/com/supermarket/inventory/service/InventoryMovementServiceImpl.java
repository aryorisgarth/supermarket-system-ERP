package com.supermarket.inventory.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.supermarket.inventory.dto.InventoryMovementRequestDTO;
import com.supermarket.inventory.dto.InventoryMovementResponseDTO;
import com.supermarket.inventory.mapper.InventoryMovementMapper;
import com.supermarket.inventory.model.InventoryMovementType;
import com.supermarket.inventory.repository.InventoryMovementRepository;
import com.supermarket.product.entity.Product;
import com.supermarket.product.repository.ProductRepository;
import com.supermarket.productbatch.entity.ProductBatch;
import com.supermarket.productbatch.repository.ProductBatchRepository;
import com.supermarket.security.SecurityUtils;
import com.supermarket.user.entity.User;
import com.supermarket.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InventoryMovementServiceImpl implements InventoryMovementService {

	private final InventoryMovementRepository inventoryMovementRepository;
	private final ProductRepository productRepository;
	private final ProductBatchRepository productBatchRepository;
	private final UserRepository userRepository;
	private final InventoryMovementMapper inventoryMovementMapper;
	private final InventoryLedger inventoryLedger;

	@Override
	public Page<InventoryMovementResponseDTO> findAll(Pageable pageable) {
		return inventoryMovementRepository.findAll(pageable)
				.map(inventoryMovementMapper::toResponse);
	}

	@Override
	public List<InventoryMovementResponseDTO> findByProductId(Long productId) {
		return inventoryMovementRepository.findByProductIdOrderByCreatedAtDesc(productId).stream()
				.map(inventoryMovementMapper::toResponse)
				.toList();
	}

	@Override
	public List<InventoryMovementResponseDTO> findBetween(LocalDateTime from, LocalDateTime to) {
		return inventoryMovementRepository.findBetween(from, to).stream()
				.map(inventoryMovementMapper::toResponse)
				.toList();
	}

	@Override
	@Transactional
	public InventoryMovementResponseDTO create(InventoryMovementRequestDTO request) {
		if (request.getMovementType() == InventoryMovementType.SALE) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
					"Sale movements are created automatically when registering a sale");
		}

		Long userId = SecurityUtils.currentUserId();
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

		Product product = productRepository.findByIdForUpdate(request.getProductId())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product not found"));

		ProductBatch batch = null;
		if (request.getBatchId() != null) {
			batch = productBatchRepository.findByIdAndProductIdForUpdate(request.getBatchId(), product.getId())
					.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Batch not found for product"));
		}

		inventoryLedger.record(user, product, batch, request.getMovementType(), request.getQuantity(),
				request.getFactor(), request.getReferenceId(), request.getNotes());

		return inventoryMovementRepository.findByProductIdOrderByCreatedAtDesc(product.getId()).stream()
				.findFirst()
				.map(inventoryMovementMapper::toResponse)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Movement not persisted"));
	}
}
