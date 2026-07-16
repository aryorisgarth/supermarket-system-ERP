package com.supermarket.producthistory.service;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.supermarket.producthistory.dto.ProductCostHistoryResponseDTO;
import com.supermarket.producthistory.dto.ProductSalePriceHistoryResponseDTO;
import com.supermarket.producthistory.entity.ProductCostHistory;
import com.supermarket.producthistory.entity.ProductSalePriceHistory;
import com.supermarket.producthistory.model.ProductCostHistoryReason;
import com.supermarket.producthistory.model.ProductSalePriceHistoryReason;
import com.supermarket.producthistory.repository.ProductCostHistoryRepository;
import com.supermarket.producthistory.repository.ProductSalePriceHistoryRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductHistoryServiceImpl implements ProductHistoryService {

	private final ProductCostHistoryRepository productCostHistoryRepository;
	private final ProductSalePriceHistoryRepository productSalePriceHistoryRepository;

	@Override
	public Page<ProductCostHistoryResponseDTO> findCostHistory(Long productId, Integer supplierId, LocalDate from, LocalDate to,
			ProductCostHistoryReason reason, Pageable pageable) {
		return productCostHistoryRepository.findAll(costHistorySpec(productId, supplierId, from, to, reason), pageable)
				.map(this::toCostDto);
	}

	@Override
	public Page<ProductSalePriceHistoryResponseDTO> findSalePriceHistory(Long productId, LocalDate from, LocalDate to,
			ProductSalePriceHistoryReason reason, Pageable pageable) {
		return productSalePriceHistoryRepository.findAll(salePriceHistorySpec(productId, from, to, reason), pageable)
				.map(this::toSalePriceDto);
	}

	private Specification<ProductCostHistory> costHistorySpec(Long productId, Integer supplierId, LocalDate from, LocalDate to,
			ProductCostHistoryReason reason) {
		return Specification.where(hasCostProduct(productId))
				.and(hasSupplier(supplierId))
				.and(createdBetween(from, to))
				.and(hasCostReason(reason));
	}

	private Specification<ProductSalePriceHistory> salePriceHistorySpec(Long productId, LocalDate from, LocalDate to,
			ProductSalePriceHistoryReason reason) {
		return Specification.where(hasSaleProduct(productId))
				.and(createdBetweenSale(from, to))
				.and(hasSaleReason(reason));
	}

	private Specification<ProductCostHistory> hasCostProduct(Long productId) {
		return (root, query, cb) -> productId == null ? null : cb.equal(root.get("product").get("id"), productId);
	}

	private Specification<ProductCostHistory> hasSupplier(Integer supplierId) {
		return (root, query, cb) -> {
			if (supplierId == null) {
				return null;
			}
			Long id = supplierId.longValue();
			// Match snapshot on history, or product's current supplier when history left it blank
			return cb.or(
					cb.equal(root.get("supplier").get("id"), id),
					cb.and(
							cb.isNull(root.get("supplier")),
							cb.equal(root.get("product").get("supplier").get("id"), id)));
		};
	}

	private Specification<ProductCostHistory> hasCostReason(ProductCostHistoryReason reason) {
		return (root, query, cb) -> reason == null ? null : cb.equal(root.get("reason"), reason);
	}

	private Specification<ProductCostHistory> createdBetween(LocalDate from, LocalDate to) {
		return (root, query, cb) -> {
			LocalDateTime fromDate = from != null ? from.atStartOfDay() : null;
			LocalDateTime toDate = to != null ? to.plusDays(1).atStartOfDay() : null;
			if (fromDate != null && toDate != null) {
				return cb.and(
						cb.greaterThanOrEqualTo(root.get("createdAt"), fromDate),
						cb.lessThan(root.get("createdAt"), toDate));
			}
			if (fromDate != null) {
				return cb.greaterThanOrEqualTo(root.get("createdAt"), fromDate);
			}
			if (toDate != null) {
				return cb.lessThan(root.get("createdAt"), toDate);
			}
			return null;
		};
	}

	private Specification<ProductSalePriceHistory> hasSaleProduct(Long productId) {
		return (root, query, cb) -> productId == null ? null : cb.equal(root.get("product").get("id"), productId);
	}

	private Specification<ProductSalePriceHistory> hasSaleReason(ProductSalePriceHistoryReason reason) {
		return (root, query, cb) -> reason == null ? null : cb.equal(root.get("reason"), reason);
	}

	private Specification<ProductSalePriceHistory> createdBetweenSale(LocalDate from, LocalDate to) {
		return (root, query, cb) -> {
			LocalDateTime fromDate = from != null ? from.atStartOfDay() : null;
			LocalDateTime toDate = to != null ? to.plusDays(1).atStartOfDay() : null;
			if (fromDate != null && toDate != null) {
				return cb.and(
						cb.greaterThanOrEqualTo(root.get("createdAt"), fromDate),
						cb.lessThan(root.get("createdAt"), toDate));
			}
			if (fromDate != null) {
				return cb.greaterThanOrEqualTo(root.get("createdAt"), fromDate);
			}
			if (toDate != null) {
				return cb.lessThan(root.get("createdAt"), toDate);
			}
			return null;
		};
	}

	private ProductCostHistoryResponseDTO toCostDto(ProductCostHistory history) {
		var supplier = history.getSupplier();
		if (supplier == null && history.getProduct() != null) {
			supplier = history.getProduct().getSupplier();
		}
		return new ProductCostHistoryResponseDTO(
				history.getId(),
				history.getProduct().getId(),
				history.getProduct().getName(),
				supplier != null ? supplier.getId() : null,
				supplier != null ? supplier.getCompanyName() : null,
				history.getPurchaseOrderId(),
				history.getPurchaseOrderItemId(),
				history.getPreviousLastCost(),
				history.getNewLastCost(),
				history.getPreviousAverageCost(),
				history.getNewAverageCost(),
				history.getQuantityBefore(),
				history.getQuantityReceived(),
				history.getQuantityAfter(),
				history.getCostMethod(),
				history.getReason(),
				history.getUser() != null ? history.getUser().getId() : null,
				history.getUser() != null ? history.getUser().getFullName() : null,
				history.getCreatedAt());
	}

	private ProductSalePriceHistoryResponseDTO toSalePriceDto(ProductSalePriceHistory history) {
		return new ProductSalePriceHistoryResponseDTO(
				history.getId(),
				history.getProduct().getId(),
				history.getProduct().getName(),
				history.getPreviousSalePrice(),
				history.getNewSalePrice(),
				history.getCostReference(),
				history.getMarginBeforePercent(),
				history.getMarginAfterPercent(),
				history.getReason(),
				history.getNotes(),
				history.getUser() != null ? history.getUser().getId() : null,
				history.getUser() != null ? history.getUser().getFullName() : null,
				history.getCreatedAt());
	}
}
