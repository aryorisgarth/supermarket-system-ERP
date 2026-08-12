package com.supermarket.product.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.supermarket.product.entity.Product;
import com.supermarket.producthistory.entity.ProductCostHistory;
import com.supermarket.producthistory.model.ProductCostHistoryReason;
import com.supermarket.producthistory.model.ProductCostMethod;
import com.supermarket.producthistory.repository.ProductCostHistoryRepository;
import com.supermarket.supplier.entity.Supplier;
import com.supermarket.user.entity.User;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductCostServiceImpl implements ProductCostService {

	private static final BigDecimal DEFAULT_MIN_MARGIN = new BigDecimal("20.0000");
	private static final int MONEY_SCALE = 4;

	private final ProductCostHistoryRepository productCostHistoryRepository;

	@Override
	@Transactional
	public ProductCostUpdateResult applyPurchaseReceiptCost(Product product, Supplier supplier, BigDecimal quantityReceived,
			BigDecimal newUnitCost, Long purchaseOrderId, Long purchaseOrderItemId, User actor) {
		BigDecimal previousLastCost = normalizedCost(product.getLastPurchaseCost(), product.getPurchasePrice());
		BigDecimal previousAverageCost = normalizedCost(product.getAverageCost(), previousLastCost);
		BigDecimal quantityBefore = scaleQuantity(product.getCurrentStock());
		BigDecimal received = scaleQuantity(quantityReceived);
		BigDecimal quantityAfter = quantityBefore.add(received);
		BigDecimal normalizedUnitCost = scaleMoney(newUnitCost);
		BigDecimal newAverageCost = calculateWeightedAverageCost(quantityBefore, previousAverageCost, received, normalizedUnitCost);

		product.setPurchasePrice(normalizedUnitCost);
		product.setLastPurchaseCost(normalizedUnitCost);
		product.setAverageCost(newAverageCost);
		if (product.getMinMarginPercent() == null) {
			product.setMinMarginPercent(DEFAULT_MIN_MARGIN);
		}

		ProductCostHistory history = new ProductCostHistory();
		history.setProduct(product);
		history.setSupplier(supplier);
		history.setPurchaseOrderId(purchaseOrderId);
		history.setPurchaseOrderItemId(purchaseOrderItemId);
		history.setPreviousLastCost(previousLastCost);
		history.setNewLastCost(normalizedUnitCost);
		history.setPreviousAverageCost(previousAverageCost);
		history.setNewAverageCost(newAverageCost);
		history.setQuantityBefore(quantityBefore);
		history.setQuantityReceived(received);
		history.setQuantityAfter(quantityAfter);
		history.setCostMethod(ProductCostMethod.WEIGHTED_AVERAGE);
		history.setReason(ProductCostHistoryReason.PURCHASE_RECEIPT);
		history.setUser(actor);
		history.setCreatedAt(LocalDateTime.now());
		productCostHistoryRepository.save(history);

		return buildResult(product, previousLastCost, normalizedUnitCost, previousAverageCost, newAverageCost,
				quantityBefore, received, quantityAfter);
	}

	@Override
	@Transactional
	public ProductCostUpdateResult applyManualCostAdjustment(Product product, BigDecimal newUnitCost,
			ProductCostHistoryReason reason, User actor) {
		BigDecimal previousLastCost = normalizedCost(product.getLastPurchaseCost(), product.getPurchasePrice());
		BigDecimal previousAverageCost = normalizedCost(product.getAverageCost(), previousLastCost);
		BigDecimal normalizedUnitCost = scaleMoney(newUnitCost);
		BigDecimal quantityBefore = scaleQuantity(product.getCurrentStock());

		product.setPurchasePrice(normalizedUnitCost);
		product.setLastPurchaseCost(normalizedUnitCost);
		product.setAverageCost(normalizedUnitCost);
		if (product.getMinMarginPercent() == null) {
			product.setMinMarginPercent(DEFAULT_MIN_MARGIN);
		}

		ProductCostHistory history = new ProductCostHistory();
		history.setProduct(product);
		history.setSupplier(product.getSupplier());
		history.setPreviousLastCost(previousLastCost);
		history.setNewLastCost(normalizedUnitCost);
		history.setPreviousAverageCost(previousAverageCost);
		history.setNewAverageCost(normalizedUnitCost);
		history.setQuantityBefore(quantityBefore);
		history.setQuantityReceived(BigDecimal.ZERO.setScale(MONEY_SCALE, RoundingMode.HALF_UP));
		history.setQuantityAfter(quantityBefore);
		history.setCostMethod(ProductCostMethod.MANUAL_OVERRIDE);
		history.setReason(reason);
		history.setUser(actor);
		history.setCreatedAt(LocalDateTime.now());
		productCostHistoryRepository.save(history);

		return buildResult(product, previousLastCost, normalizedUnitCost, previousAverageCost, normalizedUnitCost,
				quantityBefore, BigDecimal.ZERO.setScale(MONEY_SCALE, RoundingMode.HALF_UP), quantityBefore);
	}

	@Override
	public BigDecimal calculateWeightedAverageCost(BigDecimal quantityBefore, BigDecimal averageCostBefore,
			BigDecimal quantityReceived, BigDecimal newUnitCost) {
		BigDecimal beforeQty = scaleQuantity(quantityBefore);
		BigDecimal beforeAvg = scaleMoney(averageCostBefore);
		BigDecimal receivedQty = scaleQuantity(quantityReceived);
		BigDecimal receivedCost = scaleMoney(newUnitCost);
		BigDecimal totalQuantity = beforeQty.add(receivedQty);
		if (totalQuantity.compareTo(BigDecimal.ZERO) <= 0) {
			return receivedCost;
		}
		if (beforeQty.compareTo(BigDecimal.ZERO) <= 0) {
			return receivedCost;
		}
		return beforeQty.multiply(beforeAvg)
				.add(receivedQty.multiply(receivedCost))
				.divide(totalQuantity, MONEY_SCALE, RoundingMode.HALF_UP);
	}

	@Override
	public BigDecimal calculateMarkupPercent(BigDecimal salePrice, BigDecimal cost) {
		if (salePrice == null || cost == null || cost.compareTo(BigDecimal.ZERO) <= 0) {
			return null;
		}
		return salePrice.subtract(cost)
				.divide(cost, MONEY_SCALE, RoundingMode.HALF_UP)
				.multiply(BigDecimal.valueOf(100))
				.setScale(MONEY_SCALE, RoundingMode.HALF_UP);
	}

	@Override
	public BigDecimal calculateMarginPercent(BigDecimal salePrice, BigDecimal cost) {
		if (salePrice == null || cost == null
				|| salePrice.compareTo(BigDecimal.ZERO) <= 0
				|| cost.compareTo(BigDecimal.ZERO) < 0) {
			return null;
		}
		return salePrice.subtract(cost)
				.divide(salePrice, MONEY_SCALE, RoundingMode.HALF_UP)
				.multiply(BigDecimal.valueOf(100))
				.setScale(MONEY_SCALE, RoundingMode.HALF_UP);
	}

	@Override
	public BigDecimal calculateCurrentMarkupPercent(Product product) {
		if (product == null) {
			return null;
		}
		return calculateMarkupPercent(product.getSalePrice(), resolveOperationalCost(product));
	}

	@Override
	public BigDecimal calculateCurrentMarginPercent(Product product) {
		if (product == null) {
			return null;
		}
		return calculateMarginPercent(product.getSalePrice(), resolveOperationalCost(product));
	}

	@Override
	public BigDecimal calculateSuggestedSalePrice(BigDecimal cost, BigDecimal minMarkupPercent) {
		if (cost == null || cost.compareTo(BigDecimal.ZERO) <= 0) {
			return null;
		}
		BigDecimal markup = minMarkupPercent != null ? minMarkupPercent : DEFAULT_MIN_MARGIN;
		return cost.multiply(BigDecimal.ONE.add(
				markup.divide(BigDecimal.valueOf(100), MONEY_SCALE, RoundingMode.HALF_UP)))
				.setScale(MONEY_SCALE, RoundingMode.HALF_UP);
	}

	@Override
	public BigDecimal resolveOperationalCost(Product product) {
		if (product == null) {
			return BigDecimal.ZERO.setScale(MONEY_SCALE, RoundingMode.HALF_UP);
		}
		return resolveCostReference(product);
	}

	private ProductCostUpdateResult buildResult(Product product, BigDecimal previousLastCost, BigDecimal newLastCost,
			BigDecimal previousAverageCost, BigDecimal newAverageCost, BigDecimal quantityBefore,
			BigDecimal quantityReceived, BigDecimal quantityAfter) {
		// Columna BD min_margin_percent = markup mínimo (sin migración).
		BigDecimal minMarkup = product.getMinMarginPercent() != null ? product.getMinMarginPercent() : DEFAULT_MIN_MARGIN;
		BigDecimal currentMarkup = calculateMarkupPercent(product.getSalePrice(), newAverageCost);
		BigDecimal currentMargin = calculateMarginPercent(product.getSalePrice(), newAverageCost);
		boolean markupAlert = currentMarkup != null && currentMarkup.compareTo(minMarkup) < 0;
		return new ProductCostUpdateResult(
				product.getId(),
				product.getName(),
				previousLastCost,
				newLastCost,
				previousAverageCost,
				newAverageCost,
				quantityBefore,
				quantityReceived,
				quantityAfter,
				product.getSalePrice(),
				currentMarkup,
				currentMargin,
				minMarkup,
				calculateSuggestedSalePrice(newAverageCost, minMarkup),
				markupAlert);
	}

	private BigDecimal resolveCostReference(Product product) {
		return normalizedCost(product.getAverageCost(), normalizedCost(product.getLastPurchaseCost(), product.getPurchasePrice()));
	}

	private BigDecimal normalizedCost(BigDecimal primary, BigDecimal fallback) {
		BigDecimal value = primary != null ? primary : fallback;
		return scaleMoney(value != null ? value : BigDecimal.ZERO);
	}

	private BigDecimal scaleMoney(BigDecimal value) {
		return (value != null ? value : BigDecimal.ZERO).setScale(MONEY_SCALE, RoundingMode.HALF_UP);
	}

	private BigDecimal scaleQuantity(BigDecimal value) {
		return (value != null ? value : BigDecimal.ZERO).setScale(MONEY_SCALE, RoundingMode.HALF_UP);
	}
}
