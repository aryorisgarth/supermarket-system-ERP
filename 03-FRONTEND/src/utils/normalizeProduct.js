
export function normalizeProduct(raw) {
  if (!raw || typeof raw !== 'object') {
    return raw;
  }

  const category =
    raw.category ??
    (raw.categoryName ? { id: raw.categoryId, name: raw.categoryName } : null) ??
    (raw.category_name ? { id: raw.category_id, name: raw.category_name } : null);

  let salePrice = Number(raw.salePrice ?? raw.sale_price ?? 0);
  let name = raw.name ?? raw.productName ?? raw.nombre ?? raw.product_name ?? raw.descripcion_corta ?? '';
  let barcode = raw.barcode ?? raw.productBarcode ?? raw.codigo_barras ?? raw.codigo ?? raw.product_barcode ?? raw.sku ?? '';
  const uomConversionId = raw.scannedConversion?.id ?? null;
  const uomLabel = raw.scannedConversion?.label ?? null;
  const uomFactor = raw.scannedConversion?.factor ? Number(raw.scannedConversion.factor) : 1;

  if (raw.scannedConversion) {
    salePrice = Number(raw.scannedConversion.salePrice ?? raw.scannedConversion.sale_price ?? salePrice);
    name = `${name} (${raw.scannedConversion.label})`;
    barcode = raw.scannedConversion.barcode ?? barcode;
  }

  return {
    ...raw,
    id: raw.id,
    name,
    barcode,
    description: raw.description ?? raw.descripcion ?? '',
    salePrice,
    purchasePrice: Number(raw.purchasePrice ?? raw.purchase_price ?? 0),
    currentStock: Number(raw.currentStock ?? raw.current_stock ?? 0),
    minimumStock: Number(raw.minimumStock ?? raw.minimum_stock ?? 0),
    isActive: raw.isActive ?? raw.is_active ?? true,
    category,
    supplier: raw.supplier ?? null,
    taxCategory: raw.taxCategory ?? raw.tax_category ?? null,
    uomConversionId,
    uomLabel,
    uomFactor,
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
