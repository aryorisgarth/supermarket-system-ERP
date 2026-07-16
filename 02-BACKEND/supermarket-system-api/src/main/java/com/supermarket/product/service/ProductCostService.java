package com.supermarket.product.service;

import java.math.BigDecimal;

import com.supermarket.product.entity.Product;
import com.supermarket.producthistory.model.ProductCostHistoryReason;
import com.supermarket.supplier.entity.Supplier;
import com.supermarket.user.entity.User;

public interface ProductCostService {

	ProductCostUpdateResult applyPurchaseReceiptCost(Product product, Supplier supplier, BigDecimal quantityReceived,
			BigDecimal newUnitCost, Long purchaseOrderId, Long purchaseOrderItemId, User actor);

	ProductCostUpdateResult applyManualCostAdjustment(Product product, BigDecimal newUnitCost,
			ProductCostHistoryReason reason, User actor);

	BigDecimal calculateWeightedAverageCost(BigDecimal quantityBefore, BigDecimal averageCostBefore,
			BigDecimal quantityReceived, BigDecimal newUnitCost);

	BigDecimal calculateMarginPercent(BigDecimal salePrice, BigDecimal cost);

	BigDecimal calculateCurrentMarginPercent(Product product);

	BigDecimal calculateSuggestedSalePrice(BigDecimal cost, BigDecimal minMarginPercent);

	BigDecimal resolveOperationalCost(Product product);
}
