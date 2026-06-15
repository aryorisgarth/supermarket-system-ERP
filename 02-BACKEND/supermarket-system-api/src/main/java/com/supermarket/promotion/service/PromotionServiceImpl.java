package com.supermarket.promotion.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.supermarket.category.entity.Category;
import com.supermarket.category.repository.CategoryRepository;
import com.supermarket.exception.BadRequestException;
import com.supermarket.exception.ResourceNotFoundException;
import com.supermarket.product.entity.Product;
import com.supermarket.product.entity.ProductUomConversion;
import com.supermarket.product.repository.ProductRepository;
import com.supermarket.product.repository.ProductUomConversionRepository;
import com.supermarket.productbatch.entity.ProductBatch;
import com.supermarket.productbatch.repository.ProductBatchRepository;
import com.supermarket.promotion.dto.AppliedPromotionDTO;
import com.supermarket.promotion.dto.PromotionRequestDTO;
import com.supermarket.promotion.dto.PromotionResponseDTO;
import com.supermarket.promotion.entity.Promotion;
import com.supermarket.promotion.mapper.PromotionMapper;
import com.supermarket.promotion.model.PromotionType;
import com.supermarket.promotion.repository.PromotionRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PromotionServiceImpl implements PromotionService {

	private static final int SCALE = 4;

	private final PromotionRepository promotionRepository;
	private final ProductRepository productRepository;
	private final CategoryRepository categoryRepository;
	private final ProductBatchRepository productBatchRepository;
	private final ProductUomConversionRepository productUomConversionRepository;
	private final PromotionMapper promotionMapper;

	@Override
	public Page<PromotionResponseDTO> findAll(String search, Boolean activeOnly, Boolean inactiveOnly, Pageable pageable) {
		String normalized = (search != null && !search.isBlank()) ? search.trim() : null;
		boolean onlyActive = Boolean.TRUE.equals(activeOnly);
		boolean onlyInactive = Boolean.TRUE.equals(inactiveOnly);
		if (normalized == null && !onlyActive && !onlyInactive) {
			return promotionRepository.findAllByOrderByStartDateDesc(pageable).map(promotionMapper::toResponse);
		}
		return promotionRepository.searchPage(normalized, onlyActive, onlyInactive, pageable).map(promotionMapper::toResponse);
	}

	@Override
	public PromotionResponseDTO findById(Long id) {
		return promotionMapper.toResponse(find(id));
	}

	@Override
	@Transactional
	public PromotionResponseDTO create(PromotionRequestDTO req) {
		validate(req, null);
		Promotion p = build(req, new Promotion());
		p.setCreatedAt(LocalDateTime.now());
		return promotionMapper.toResponse(promotionRepository.save(p));
	}

	@Override
	@Transactional
	public PromotionResponseDTO update(Long id, PromotionRequestDTO req) {
		Promotion p = find(id);
		validate(req, id);
		build(req, p);
		return promotionMapper.toResponse(promotionRepository.save(p));
	}

	@Override
	@Transactional
	public void toggleActive(Long id) {
		Promotion p = find(id);
		p.setIsActive(!Boolean.TRUE.equals(p.getIsActive()));
		promotionRepository.save(p);
	}

	@Override
	@Transactional
	public void delete(Long id) {
		Promotion p = find(id);
		promotionRepository.delete(p);
	}

	@Override
	public List<PromotionResponseDTO> findActive() {
		return promotionRepository.findExpiryTriggered(LocalDate.now()).stream()
				.map(promotionMapper::toResponse)
				.toList();
	}

	@Override
	public Optional<AppliedPromotionDTO> bestPromotion(Long productId, BigDecimal quantity, Long uomConversionId) {
		Product product = productRepository.findById(productId).orElse(null);
		if (product == null) return Optional.empty();

		BigDecimal factor = BigDecimal.ONE;
		BigDecimal unitPrice = product.getSalePrice();

		if (uomConversionId != null) {
			ProductUomConversion conversion = productUomConversionRepository.findByIdAndProductId(uomConversionId, productId).orElse(null);
			if (conversion != null) {
				factor = conversion.getFactor();
				unitPrice = conversion.getSalePrice() != null ? conversion.getSalePrice() : product.getSalePrice().multiply(factor);
			}
		}

		
		BigDecimal quantityBase = quantity.multiply(factor);

		Short categoryId = product.getCategory() != null ? product.getCategory().getId() : null;
		List<Promotion> candidates = promotionRepository.findActiveForProduct(
				productId, categoryId != null ? categoryId.longValue() : -1L, LocalDate.now());

		
		if (candidates.isEmpty()) return Optional.empty();

		
		Integer nearestExpiry = nearestExpiryDays(productId);

		final BigDecimal finalFactor = factor;
		final BigDecimal finalUnitPrice = unitPrice;

		return candidates.stream()
				.filter(p -> quantityBase.compareTo(p.getMinQuantity()) >= 0)
				.filter(p -> {
					if (p.getExpiryDaysTrigger() == null) return true;
					return nearestExpiry != null && nearestExpiry <= p.getExpiryDaysTrigger();
				})
				.map(p -> calculateApplied(p, quantity, finalUnitPrice, finalFactor))
				.filter(a -> a.discountAmount().compareTo(BigDecimal.ZERO) > 0)
				.max(Comparator.comparing(AppliedPromotionDTO::discountAmount));
	}

	

	private Promotion find(Long id) {
		return promotionRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Promotion not found"));
	}

	private void validate(PromotionRequestDTO req, Long excludeId) {
		if (req.getProductId() == null && req.getCategoryId() == null) {
			throw new BadRequestException("La promoción debe aplicarse a un producto o a una categoría");
		}
		if (req.getProductId() != null && req.getCategoryId() != null) {
			throw new BadRequestException("Especifique sólo producto o sólo categoría, no ambos");
		}
		if (req.getEndDate().isBefore(req.getStartDate())) {
			throw new BadRequestException("La fecha de fin debe ser igual o posterior a la de inicio");
		}
		if (req.getType() == PromotionType.PERCENTAGE && req.getValue().compareTo(BigDecimal.valueOf(100)) > 0) {
			throw new BadRequestException("El porcentaje no puede superar el 100%");
		}
	}

	private Promotion build(PromotionRequestDTO req, Promotion p) {
		p.setName(req.getName().trim());
		p.setDescription(req.getDescription() != null ? req.getDescription().trim() : null);
		p.setType(req.getType());
		p.setValue(req.getValue());
		p.setMinQuantity(req.getMinQuantity() != null ? req.getMinQuantity() : BigDecimal.ONE);
		p.setExpiryDaysTrigger(req.getExpiryDaysTrigger());
		p.setStartDate(req.getStartDate());
		p.setEndDate(req.getEndDate());
		p.setIsActive(req.getIsActive() == null ? true : req.getIsActive());

		if (req.getProductId() != null) {
			p.setProduct(productRepository.findById(req.getProductId())
					.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Producto no encontrado")));
			p.setCategory(null);
		} else {
			Short catId = req.getCategoryId().shortValue();
			p.setCategory(categoryRepository.findById(catId)
					.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Categoría no encontrada")));
			p.setProduct(null);
		}
		return p;
	}

	private AppliedPromotionDTO calculateApplied(Promotion promo, BigDecimal quantity, BigDecimal unitPrice, BigDecimal factor) {
		BigDecimal discount;
		String label;
		switch (promo.getType()) {
			case PERCENTAGE -> {
				
				discount = unitPrice.multiply(promo.getValue())
						.divide(BigDecimal.valueOf(100), SCALE, RoundingMode.HALF_UP)
						.multiply(quantity).setScale(SCALE, RoundingMode.HALF_UP);
				label = String.format("%s%% dto. — %s", promo.getValue().stripTrailingZeros().toPlainString(), promo.getName());
			}
			case FIXED -> {
				
				
				BigDecimal discountPerUnitCommercial = promo.getValue().multiply(factor);
				discount = discountPerUnitCommercial.multiply(quantity).setScale(SCALE, RoundingMode.HALF_UP);
				label = String.format("Dto. fijo %s c/u — %s", promo.getValue().stripTrailingZeros().toPlainString(), promo.getName());
			}
			case BOGO -> {
				
				BigDecimal quantityBase = quantity.multiply(factor);
				BigDecimal freeUnitsBase = quantityBase.divide(BigDecimal.valueOf(2), 0, RoundingMode.FLOOR);
				
				BigDecimal effectiveUnitPriceBase = unitPrice.divide(factor, SCALE, RoundingMode.HALF_UP);
				discount = effectiveUnitPriceBase.multiply(freeUnitsBase).setScale(SCALE, RoundingMode.HALF_UP);
				label = String.format("2x1 — %s (cada 2 u., 1 gratis)", promo.getName());
			}
			default -> {
				discount = BigDecimal.ZERO;
				label = promo.getName();
			}
		}
		if (discount.compareTo(BigDecimal.ZERO) <= 0) label = promo.getName();
		return new AppliedPromotionDTO(promo.getId(), promo.getName(), promo.getType(), discount, label);
	}

	
	private Integer nearestExpiryDays(Long productId) {
		return productBatchRepository.findByProductIdOrderByExpirationDateAsc(productId).stream()
				.filter(b -> b.getCurrentQuantity().compareTo(BigDecimal.ZERO) > 0)
				.filter(b -> b.getExpirationDate() != null)
				.findFirst()
				.map(b -> (int) ChronoUnit.DAYS.between(LocalDate.now(), b.getExpirationDate()))
				.orElse(null);
	}
}
