package com.supermarket.product.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.supermarket.product.entity.Product;
import com.supermarket.producthistory.entity.ProductSalePriceHistory;
import com.supermarket.producthistory.model.ProductCostReference;
import com.supermarket.producthistory.model.ProductSalePriceHistoryReason;
import com.supermarket.producthistory.repository.ProductSalePriceHistoryRepository;
import com.supermarket.user.entity.User;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductPriceServiceImpl implements ProductPriceService {

	private static final int MONEY_SCALE = 4;

	private final ProductSalePriceHistoryRepository productSalePriceHistoryRepository;
	private final ProductCostService productCostService;

	@Override
	@Transactional
	public void updateSalePrice(Product product, BigDecimal previousSalePrice, BigDecimal newSalePrice,
			ProductSalePriceHistoryReason reason, String notes, User actor) {
		BigDecimal normalizedPreviousSalePrice = previousSalePrice != null
				? previousSalePrice.setScale(MONEY_SCALE, RoundingMode.HALF_UP)
				: null;
		BigDecimal normalizedNewSalePrice = newSalePrice.setScale(MONEY_SCALE, RoundingMode.HALF_UP);
		if (normalizedPreviousSalePrice != null && normalizedPreviousSalePrice.compareTo(normalizedNewSalePrice) == 0) {
			return;
		}

		ProductCostReference costReference = product.getAverageCost() != null
				? ProductCostReference.AVERAGE_COST
				: ProductCostReference.LAST_PURCHASE_COST;
		BigDecimal referenceCost = costReference == ProductCostReference.AVERAGE_COST
				? product.getAverageCost()
				: product.getLastPurchaseCost();

		ProductSalePriceHistory history = new ProductSalePriceHistory();
		history.setProduct(product);
		history.setPreviousSalePrice(normalizedPreviousSalePrice != null
				? normalizedPreviousSalePrice
				: BigDecimal.ZERO.setScale(MONEY_SCALE, RoundingMode.HALF_UP));
		history.setNewSalePrice(normalizedNewSalePrice);
		history.setCostReference(costReference);
		// Columnas BD margin_*_percent almacenan markup (sin migración).
		history.setMarginBeforePercent(productCostService.calculateMarkupPercent(normalizedPreviousSalePrice, referenceCost));
		history.setMarginAfterPercent(productCostService.calculateMarkupPercent(normalizedNewSalePrice, referenceCost));
		history.setReason(reason != null ? reason : ProductSalePriceHistoryReason.MANUAL_UPDATE);
		history.setNotes(notes);
		history.setUser(actor);
		history.setCreatedAt(LocalDateTime.now());
		productSalePriceHistoryRepository.save(history);

		product.setSalePrice(normalizedNewSalePrice);
	}
}
