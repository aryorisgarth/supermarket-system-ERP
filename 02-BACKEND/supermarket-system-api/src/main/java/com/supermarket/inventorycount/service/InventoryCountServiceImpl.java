package com.supermarket.inventorycount.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.supermarket.alerts.service.SystemAlertService;
import com.supermarket.inventory.model.InventoryMovementType;
import com.supermarket.inventory.service.InventoryLedger;
import com.supermarket.inventorycount.dto.InventoryCountScanRequestDTO;
import com.supermarket.inventorycount.dto.InventoryCountSessionRequestDTO;
import com.supermarket.inventorycount.dto.InventoryCountSessionResponseDTO;
import com.supermarket.inventorycount.entity.InventoryCountLine;
import com.supermarket.inventorycount.entity.InventoryCountSession;
import com.supermarket.inventorycount.mapper.InventoryCountMapper;
import com.supermarket.inventorycount.model.InventoryCountStatus;
import com.supermarket.inventorycount.repository.InventoryCountLineRepository;
import com.supermarket.inventorycount.repository.InventoryCountSessionRepository;
import com.supermarket.product.entity.Product;
import com.supermarket.product.entity.ProductUomConversion;
import com.supermarket.product.repository.ProductRepository;
import com.supermarket.product.repository.ProductUomConversionRepository;
import com.supermarket.productbatch.entity.ProductBatch;
import com.supermarket.productbatch.repository.ProductBatchRepository;
import com.supermarket.security.SecurityUtils;
import com.supermarket.user.entity.User;
import com.supermarket.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InventoryCountServiceImpl implements InventoryCountService {

	private final InventoryCountSessionRepository sessionRepository;
	private final InventoryCountLineRepository lineRepository;
	private final ProductRepository productRepository;
	private final UserRepository userRepository;
	private final InventoryCountMapper inventoryCountMapper;
	private final InventoryLedger inventoryLedger;
	private final SystemAlertService systemAlertService;
	private final ProductUomConversionRepository productUomConversionRepository;
	private final ProductBatchRepository productBatchRepository;

	@Override
	public Page<InventoryCountSessionResponseDTO> findPage(InventoryCountStatus status, Pageable pageable) {
		return sessionRepository.findPage(status, pageable).map(inventoryCountMapper::toSummary);
	}

	@Override
	public InventoryCountSessionResponseDTO findById(Long id) {
		return inventoryCountMapper.toResponse(loadSessionWithDetails(id));
	}

	@Override
	@Transactional
	public InventoryCountSessionResponseDTO create(InventoryCountSessionRequestDTO request) {
		User actor = currentUser();
		LocalDateTime now = LocalDateTime.now();

		InventoryCountSession session = new InventoryCountSession();
		session.setSessionCode(generateSessionCode());
		session.setStatus(InventoryCountStatus.OPEN);
		session.setNotes(request.getNotes());
		session.setWarehouseZone(request.getWarehouseZone());
		session.setCreatedBy(actor);
		session.setCreatedAt(now);
		session.setUpdatedAt(now);

		return inventoryCountMapper.toResponse(sessionRepository.save(session));
	}

	@Override
	@Transactional
	public InventoryCountSessionResponseDTO scan(Long sessionId, InventoryCountScanRequestDTO request) {
		InventoryCountSession session = loadOpenSession(sessionId);
		
		var uomOpt = productUomConversionRepository.findByBarcode(request.getBarcode().trim());
		Product product;
		ProductUomConversion conversion = null;
		BigDecimal factor = BigDecimal.ONE;

		if (uomOpt.isPresent()) {
			conversion = uomOpt.get();
			product = conversion.getProduct();
			factor = conversion.getFactor();
		} else {
			product = productRepository.findByBarcode(request.getBarcode().trim())
					.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found for barcode"));
		}

		BigDecimal delta = request.getQuantityDelta() != null ? request.getQuantityDelta() : BigDecimal.ONE;
		if (delta.compareTo(BigDecimal.ZERO) <= 0) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quantity delta must be positive");
		}

		BigDecimal deltaBase = delta.multiply(factor);

		InventoryCountLine line;
		ProductBatch batch = null;

		if (Boolean.TRUE.equals(product.getRequiresBatch())) {
			if (request.getBatchId() == null) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El producto requiere especificar un lote para el conteo.");
			}
			batch = productBatchRepository.findByIdAndProductId(request.getBatchId(), product.getId())
					.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Batch not found for this product"));
			
			final ProductBatch finalBatch = batch;
			line = lineRepository.findBySessionIdAndProductIdAndBatchId(sessionId, product.getId(), batch.getId())
					.orElseGet(() -> createLine(session, product, finalBatch));
		} else {
			if (request.getBatchId() != null) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Este producto no maneja lotes.");
			}
			line = lineRepository.findBySessionIdAndProductIdAndBatchIsNull(sessionId, product.getId())
					.orElseGet(() -> createLine(session, product, null));
		}

		line.setCountedQuantity(line.getCountedQuantity().add(deltaBase));
		if (conversion != null) {
			line.setUomConversion(conversion);
		}
		
		recalculateVariance(line);
		lineRepository.save(line);
		session.setUpdatedAt(LocalDateTime.now());
		sessionRepository.save(session);

		return inventoryCountMapper.toResponse(loadSessionWithDetails(sessionId));
	}

	@Override
	@Transactional
	public InventoryCountSessionResponseDTO submit(Long sessionId) {
		InventoryCountSession session = loadOpenSession(sessionId);
		if (session.getLines().isEmpty()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Add at least one counted product before submitting");
		}

		session.getLines().forEach(this::recalculateVariance);
		session.setStatus(InventoryCountStatus.SUBMITTED);
		session.setSubmittedAt(LocalDateTime.now());
		session.setUpdatedAt(LocalDateTime.now());
		InventoryCountSession saved = sessionRepository.save(session);
		systemAlertService.notifyInventoryCountSubmitted(saved);
		return inventoryCountMapper.toResponse(saved);
	}

	@Override
	@Transactional
	public InventoryCountSessionResponseDTO approve(Long sessionId) {
		InventoryCountSession session = loadSessionWithDetails(sessionId);
		if (session.getStatus() != InventoryCountStatus.SUBMITTED) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Only submitted counts can be approved");
		}

		User approver = currentUser();
		List<InventoryCountLine> linesWithVariance = session.getLines().stream()
				.filter(line -> line.getVariance().compareTo(BigDecimal.ZERO) != 0)
				.toList();

		for (InventoryCountLine line : linesWithVariance) {
			applyVarianceAdjustment(approver, session, line);
		}

		session.setStatus(InventoryCountStatus.APPROVED);
		session.setApprovedBy(approver);
		session.setApprovedAt(LocalDateTime.now());
		session.setUpdatedAt(LocalDateTime.now());
		InventoryCountSession saved = sessionRepository.save(session);
		systemAlertService.resolveInventoryCountAlert(sessionId);
		return inventoryCountMapper.toResponse(saved);
	}

	@Override
	@Transactional
	public InventoryCountSessionResponseDTO cancel(Long sessionId) {
		InventoryCountSession session = loadSessionWithDetails(sessionId);
		if (session.getStatus() != InventoryCountStatus.OPEN) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Only open counts can be cancelled");
		}
		session.setStatus(InventoryCountStatus.CANCELLED);
		session.setUpdatedAt(LocalDateTime.now());
		return inventoryCountMapper.toResponse(sessionRepository.save(session));
	}

	@Override
	@Transactional
	public InventoryCountSessionResponseDTO claim(Long id) {
		InventoryCountSession session = loadOpenSession(id);
		User currentUser = currentUser();

		if (session.getCountedBy() != null && !session.getCountedBy().getId().equals(currentUser.getId())) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "El conteo ya fue tomado por otro usuario.");
		}

		session.setCountedBy(currentUser);
		session.setUpdatedAt(LocalDateTime.now());
		return inventoryCountMapper.toResponse(sessionRepository.save(session));
	}

	@Override
	@Transactional
	public InventoryCountSessionResponseDTO assign(Long id, Long userId) {
		InventoryCountSession session = loadOpenSession(id);
		
		User newAssignee = userRepository.findById(userId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado."));

		session.setCountedBy(newAssignee);
		session.setUpdatedAt(LocalDateTime.now());
		return inventoryCountMapper.toResponse(sessionRepository.save(session));
	}

	private void applyVarianceAdjustment(User approver, InventoryCountSession session, InventoryCountLine line) {
		BigDecimal variance = line.getVariance();
		BigDecimal quantity = variance.abs();
		byte factor = variance.compareTo(BigDecimal.ZERO) > 0 ? (byte) 1 : (byte) -1;

		Product product = productRepository.findByIdForUpdate(line.getProduct().getId())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

		BigDecimal uomQty = line.getUomConversion() != null
				? quantity.divide(line.getUomConversion().getFactor(), 4, java.math.RoundingMode.HALF_UP)
				: quantity;

		inventoryLedger.record(
				approver,
				product,
				line.getBatch(),
				InventoryMovementType.ADJUSTMENT,
				quantity,
				factor,
				session.getId(),
				line.getId(),
				"INVENTORY_COUNT",
				product.getPurchasePrice(),
				line.getUomConversion(),
				uomQty,
				"Ajuste por conteo " + session.getSessionCode());
	}

	private InventoryCountLine createLine(InventoryCountSession session, Product product, ProductBatch batch) {
		InventoryCountLine line = new InventoryCountLine();
		line.setSession(session);
		line.setProduct(product);
		line.setBatch(batch);
		line.setBarcode(product.getBarcode());
		
		BigDecimal systemQty = batch != null ? batch.getCurrentQuantity() : product.getCurrentStock();
		line.setSystemQuantity(systemQty != null ? systemQty : BigDecimal.ZERO);
		
		line.setCountedQuantity(BigDecimal.ZERO);
		line.setVariance(BigDecimal.ZERO);
		session.getLines().add(line);
		return lineRepository.save(line);
	}

	private void recalculateVariance(InventoryCountLine line) {
		line.setVariance(line.getCountedQuantity().subtract(line.getSystemQuantity()));
	}

	private InventoryCountSession loadOpenSession(Long id) {
		InventoryCountSession session = loadSessionWithDetails(id);
		if (session.getStatus() != InventoryCountStatus.OPEN) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Count session is not open");
		}
		return session;
	}

	private InventoryCountSession loadSessionWithDetails(Long id) {
		return sessionRepository.findByIdWithDetails(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Count session not found"));
	}

	private User currentUser() {
		return userRepository.findById(SecurityUtils.currentUserId())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
	}

	private String generateSessionCode() {
		String prefix = "CC-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
		String code = prefix;
		int suffix = 1;
		while (sessionRepository.findBySessionCode(code).isPresent()) {
			code = prefix + "-" + suffix++;
		}
		return code;
	}
}
