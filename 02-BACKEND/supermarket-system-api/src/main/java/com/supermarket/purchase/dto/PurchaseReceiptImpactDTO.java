package com.supermarket.purchase.dto;

import java.math.BigDecimal;

import com.supermarket.product.model.ProductPricingPolicy;
import com.supermarket.purchase.model.PurchasePricingDecision;

/**
 * Impacto de recepción listo para UI.
 * Markup = (venta−costo)/costo; Margen = (venta−costo)/venta.
 * Compat: minMarginPercent / marginAlert = markup mínimo / alerta de markup.
 */
public record PurchaseReceiptImpactDTO(
		Long productId,
		String productName,
		BigDecimal previousLastCost,
		BigDecimal newLastCost,
		BigDecimal previousAverageCost,
		BigDecimal newAverageCost,
		BigDecimal quantityBefore,
		BigDecimal quantityReceived,
		BigDecimal quantityAfter,
		/** Precio de venta antes de aplicar la política en esta recepción. */
		BigDecimal previousSalePrice,
		/** Precio de venta vigente tras la recepción. */
		BigDecimal salePrice,
		/** Precio recomendado por markup mínimo sobre el nuevo costo de compra. */
		BigDecimal suggestedSalePrice,
		BigDecimal currentMarkupPercent,
		BigDecimal currentMarginPercent,
		BigDecimal minMarkupPercent,
		ProductPricingPolicy pricingPolicy,
		PurchasePricingDecision pricingDecision,
		/** Mensaje listo para mostrar (qué se calculó y qué se decidió). */
		String decisionMessage,
		/** true si products.sale_price cambió en esta recepción. */
		boolean salePriceApplied,
		boolean markupAlert,
		BigDecimal minMarginPercent,
		boolean marginAlert
) {
}
