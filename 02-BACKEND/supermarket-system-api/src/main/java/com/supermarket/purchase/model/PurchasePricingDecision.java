package com.supermarket.purchase.model;

/**
 * Decisión de precio de venta tomada al recibir una compra.
 * El frontend solo debe representar este código + decisionMessage.
 */
public enum PurchasePricingDecision {
	/** Política AUTO: se recalculó y aplicó venta por markup. */
	APPLIED_AUTO,
	/** Política MANUAL: se aplicó el precio enviado en la OC. */
	APPLIED_MANUAL,
	/** Política SUGGEST: solo se recomienda; no se cambió la venta. */
	SUGGESTED_ONLY,
	/** No hubo cambio de precio de venta (manual sin precio en OC, o sin sugerido). */
	NO_CHANGE
}
