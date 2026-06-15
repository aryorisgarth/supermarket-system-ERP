package com.supermarket.productbatch.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.supermarket.inventory.model.InventoryMovementType;
import com.supermarket.inventory.service.InventoryLedger;
import com.supermarket.product.entity.Product;
import com.supermarket.product.repository.ProductRepository;
import com.supermarket.productbatch.dto.BatchExpirySummaryDTO;
import com.supermarket.productbatch.dto.ProductBatchRequestDTO;
import com.supermarket.productbatch.dto.ProductBatchResponseDTO;
import com.supermarket.productbatch.entity.ProductBatch;
import com.supermarket.productbatch.mapper.ProductBatchMapper;
import com.supermarket.productbatch.repository.ProductBatchRepository;
import com.supermarket.security.SecurityUtils;
import com.supermarket.user.entity.User;
import com.supermarket.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductBatchServiceImpl implements ProductBatchService {

	private final ProductBatchRepository productBatchRepository;
	private final ProductRepository productRepository;
	private final ProductBatchMapper productBatchMapper;
	private final UserRepository userRepository;
	private final InventoryLedger inventoryLedger;

	@Override
	public List<ProductBatchResponseDTO> findAll() {
		return productBatchRepository.findAll().stream()
				.sorted((a, b) -> a.getExpirationDate().compareTo(b.getExpirationDate()))
				.map(productBatchMapper::toResponse)
				.toList();
	}

	@Override
	public Page<ProductBatchResponseDTO> findPage(String search, String expiryState, Pageable pageable) {
		String normalized = (search != null && !search.isBlank()) ? search.trim() : null;
		String normalizedExpiry = (expiryState == null || expiryState.isBlank() || "all".equalsIgnoreCase(expiryState))
				? null : expiryState;
		LocalDate today = LocalDate.now();
		return productBatchRepository.searchPage(
				normalized, normalizedExpiry, today, today.plusDays(7), today.plusDays(15), today.plusDays(30), pageable)
				.map(productBatchMapper::toResponse);
	}

	@Override
	public List<ProductBatchResponseDTO> findByProductId(Long productId) {
		ensureProduct(productId);
		return productBatchRepository.findByProductIdOrderByExpirationDateAsc(productId).stream()
				.map(productBatchMapper::toResponse)
				.toList();
	}

	@Override
	public List<ProductBatchResponseDTO> searchByProduct(Long productId, String q) {
		ensureProduct(productId);
		String term = q == null ? "" : q.trim();
		if (term.isEmpty()) {
			return findByProductId(productId);
		}
		return productBatchRepository.searchByProduct(productId, term).stream()
				.map(productBatchMapper::toResponse)
				.toList();
	}

	@Override
	public List<ProductBatchResponseDTO> findExpiringSoon(Long productId, int withinDays) {
		ensureProduct(productId);
		LocalDate until = LocalDate.now().plusDays(Math.max(0, withinDays));
		return productBatchRepository.findByProductIdAndExpirationDateBeforeEqual(productId, until).stream()
				.map(productBatchMapper::toResponse)
				.toList();
	}

	@Override
	public List<ProductBatchResponseDTO> findAllExpiring(int withinDays) {
		LocalDate until = LocalDate.now().plusDays(Math.max(0, withinDays));
		return productBatchRepository.findActiveExpiringUntil(until).stream()
				.map(productBatchMapper::toResponse)
				.toList();
	}

	@Override
	public List<ProductBatchResponseDTO> findAllExpired() {
		return productBatchRepository.findActiveExpired(LocalDate.now()).stream()
				.map(productBatchMapper::toResponse)
				.toList();
	}

	@Override
	public BatchExpirySummaryDTO getExpirySummary() {
		LocalDate today = LocalDate.now();
		List<ProductBatchResponseDTO> expired = findAllExpired();
		List<ProductBatchResponseDTO> within30 = findAllExpiring(30).stream()
				.filter(b -> !b.expirationDate().isBefore(today))
				.toList();
		long within7 = within30.stream()
				.filter(b -> !b.expirationDate().isAfter(today.plusDays(7)))
				.count();
		long within15 = within30.stream()
				.filter(b -> !b.expirationDate().isAfter(today.plusDays(15)))
				.count();
		return new BatchExpirySummaryDTO(
				expired.size(),
				within7,
				within15,
				within30.size(),
				expired,
				within30);
	}

	@Override
	public ProductBatchResponseDTO findById(Long id) {
		ProductBatch batch = productBatchRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Batch not found"));
		return productBatchMapper.toResponse(batch);
	}

	@Override
	@Transactional
	public ProductBatchResponseDTO create(ProductBatchRequestDTO request) {
		normalize(request);
		Product product = ensureProduct(request.getProductId());

		if (productBatchRepository.existsByBatchCodeIgnoreCase(request.getBatchCode())) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Batch code already exists");
		}
		if (request.getExpirationDate().isBefore(request.getEntryDate())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Expiration date must be on or after entry date");
		}

		ProductBatch batch = new ProductBatch();
		batch.setProduct(product);
		batch.setBatchCode(request.getBatchCode());
		batch.setInitialQuantity(request.getInitialQuantity());
		batch.setCurrentQuantity(java.math.BigDecimal.ZERO);
		batch.setEntryDate(request.getEntryDate());
		batch.setExpirationDate(request.getExpirationDate());
		batch.setCreatedAt(LocalDateTime.now());

		ProductBatch saved = productBatchRepository.save(batch);
		inventoryLedger.record(currentUser(), product, saved, InventoryMovementType.ENTRY, request.getInitialQuantity(),
				(byte) 1, saved.getId(), null, "PRODUCT_BATCH", product.getPurchasePrice(), "Initial batch quantity");
		return productBatchMapper.toResponse(saved);
	}

	@Override
	@Transactional
	public ProductBatchResponseDTO update(Long id, ProductBatchRequestDTO request) {
		normalize(request);
		ProductBatch batch = productBatchRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Batch not found"));

		String code = request.getBatchCode();
		if (!batch.getBatchCode().equalsIgnoreCase(code)
				&& productBatchRepository.existsByBatchCodeIgnoreCaseAndIdNot(code, id)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Batch code already exists");
		}
		if (request.getExpirationDate().isBefore(request.getEntryDate())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Expiration date must be on or after entry date");
		}
		if (!batch.getProduct().getId().equals(request.getProductId())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot change product of an existing batch");
		}

		batch.setBatchCode(code);
		batch.setEntryDate(request.getEntryDate());
		batch.setExpirationDate(request.getExpirationDate());

		ProductBatch saved = productBatchRepository.save(batch);
		return productBatchMapper.toResponse(saved);
	}

	@Override
	@Transactional
	public void deleteById(Long id) {
		ProductBatch batch = productBatchRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Batch not found"));

		if (productBatchRepository.countSaleDetailsByBatchId(id) > 0) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Batch cannot be deleted because it was used in sales");
		}

		if (batch.getCurrentQuantity().compareTo(java.math.BigDecimal.ZERO) > 0) {
			Product product = batch.getProduct();
			inventoryLedger.record(currentUser(), product, null, InventoryMovementType.ADJUSTMENT, batch.getCurrentQuantity(),
					(byte) -1, batch.getId(), null, "PRODUCT_BATCH_DELETE", product.getPurchasePrice(),
					"Batch deletion: " + batch.getBatchCode());
		}

		try {
			productBatchRepository.delete(batch);
		} catch (DataIntegrityViolationException ex) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Batch cannot be deleted due to related data", ex);
		}
	}

	private Product ensureProduct(Long productId) {
		return productRepository.findById(productId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product not found"));
	}

	private User currentUser() {
		return userRepository.findById(SecurityUtils.currentUserId())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
	}

	private static void normalize(ProductBatchRequestDTO request) {
		request.setBatchCode(request.getBatchCode().trim());
	}
}
