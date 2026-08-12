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

	/** Markup sobre costo: (sale - cost) / cost × 100 */
	BigDecimal calculateMarkupPercent(BigDecimal salePrice, BigDecimal cost);

	/** Margen sobre precio de venta: (sale - cost) / sale × 100 */
	BigDecimal calculateMarginPercent(BigDecimal salePrice, BigDecimal cost);

	BigDecimal calculateCurrentMarkupPercent(Product product);

	BigDecimal calculateCurrentMarginPercent(Product product);

	/** Precio sugerido por markup: cost × (1 + minMarkup/100) */
	BigDecimal calculateSuggestedSalePrice(BigDecimal cost, BigDecimal minMarkupPercent);

	BigDecimal resolveOperationalCost(Product product);
}
