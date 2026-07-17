
export function normalizeProduct(raw) {
  if (!raw || typeof raw !== 'object') {
    return raw;
  }

  const category =
    raw.category ??
    (raw.categoryName ? { id: raw.categoryId, name: raw.categoryName } : null) ??
    (raw.category_name ? { id: raw.category_id, name: raw.category_name } : null);

  let salePrice = Number(raw.salePrice ?? raw.sale_price ?? 0);
  const baseName = raw.name ?? raw.productName ?? raw.nombre ?? raw.product_name ?? raw.descripcion_corta ?? '';
  let name = baseName;
  const baseBarcode = raw.barcode ?? raw.productBarcode ?? raw.codigo_barras ?? raw.codigo ?? raw.product_barcode ?? raw.sku ?? '';
  let barcode = baseBarcode;
  const uomConversionId = raw.scannedConversion?.id ?? null;
  const uomLabel = raw.scannedConversion?.label ?? null;
  const uomFactor = raw.scannedConversion?.factor ? Number(raw.scannedConversion.factor) : 1;
  const packBarcode = raw.scannedConversion?.barcode ?? null;

  if (raw.scannedConversion) {
    salePrice = Number(raw.scannedConversion.salePrice ?? raw.scannedConversion.sale_price ?? salePrice);
    name = `${baseName} (${raw.scannedConversion.label})`;
    barcode = raw.scannedConversion.barcode ?? barcode;
  }

  return {
    ...raw,
    id: raw.id,
    name,
    baseName,
    barcode,
    baseBarcode,
    packBarcode,
    description: raw.description ?? raw.descripcion ?? '',
    salePrice,
    purchasePrice: Number(raw.purchasePrice ?? raw.purchase_price ?? 0),
    lastPurchaseCost: Number(raw.lastPurchaseCost ?? raw.last_purchase_cost ?? raw.purchasePrice ?? raw.purchase_price ?? 0),
    averageCost: Number(raw.averageCost ?? raw.average_cost ?? raw.purchasePrice ?? raw.purchase_price ?? 0),
    minMarginPercent: Number(raw.minMarginPercent ?? raw.min_margin_percent ?? 20),
    pricingPolicy: raw.pricingPolicy ?? raw.pricing_policy ?? 'MANUAL',
    currentMarginPercent:
      raw.currentMarginPercent ?? raw.current_margin_percent ?? null,
    currentStock: Number(raw.currentStock ?? raw.current_stock ?? 0),
    exhibitionStock: Number(raw.exhibitionStock ?? raw.exhibition_stock ?? 0),
    // POS vende solo stock de piso/exhibición
    availableForSale: Number(
      raw.exhibitionStock ?? raw.exhibition_stock ?? raw.availableForSale ?? raw.available_for_sale ?? 0,
    ),
    minimumStock: Number(raw.minimumStock ?? raw.minimum_stock ?? 0),
    isActive: raw.isActive ?? raw.is_active ?? true,
    category,
    supplier: raw.supplier ?? null,
    taxCategory: raw.taxCategory ?? raw.tax_category ?? null,
    uomConversionId,
    uomLabel,
    uomFactor,
    prefilledQuantity:
      raw.prefilledQuantity ?? raw.prefilled_quantity ?? null,
  };
}

export function normalizeProductList(data) {
  if (Array.isArray(data)) {
    return data.map(normalizeProduct);
  }
  if (data?.content && Array.isArray(data.content)) {
    return data.content.map(normalizeProduct);
  }
  return [];
}
