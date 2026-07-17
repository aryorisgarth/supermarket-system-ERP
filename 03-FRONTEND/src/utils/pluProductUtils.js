/** Unidades de venta por peso (balanza / etiquetas EAN-13 tipo 20xxxx). */
export function isWeightUom(uom) {
  const u = String(uom || 'UN').trim().toUpperCase();
  return u === 'LB' || u === 'KG' || u === 'GR' || u === 'G' || u === 'OZ';
}

/** Código corto numérico o alfanumérico (≤6 chars), típico PLU de frutas/verduras. */
export function isShortPluBarcode(barcode) {
  if (barcode == null || barcode === '') return false;
  const str = String(barcode).trim();
  if (str.length === 13 && /^\d{13}$/.test(str)) return false;
  const stripped = str.replace(/^0+/, '') || str;
  if (/^\d+$/.test(stripped)) return stripped.length > 0 && stripped.length <= 6;
  return str.length > 0 && str.length <= 6;
}

/** EAN-13 de balanza (prefijo configurable, por defecto 20). */
export function isScaleEanBarcode(barcode, prefix = '20') {
  const str = String(barcode || '').trim();
  const p = String(prefix || '20');
  return str.length === 13 && str.startsWith(p);
}

/** Producto vendible en balanza o panel PLU del POS. */
export function isPluProduct(product, scaleConfig = null) {
  if (!product?.barcode || product.isActive === false) return false;
  const prefix = scaleConfig?.prefix ?? '20';
  if (isWeightUom(product.uomBase)) return true;
  if (isShortPluBarcode(product.barcode)) return true;
  if (isScaleEanBarcode(product.barcode, prefix)) return true;
  return false;
}

/** PLU visible para operador (sin ceros a la izquierda). */
export function extractDisplayPlu(barcode, scaleConfig = null) {
  const str = String(barcode || '').trim();
  const prefix = String(scaleConfig?.prefix ?? '20');
  const pluLength = Number(scaleConfig?.pluLength ?? 5);

  if (isScaleEanBarcode(str, prefix)) {
    const pluStart = prefix.length;
    const raw = str.substring(pluStart, pluStart + pluLength);
    return raw.replace(/^0+/, '') || raw;
  }
  return str.replace(/^0+/, '') || str;
}

export function mapPluProduct(product, scaleConfig = null) {
  return {
    ...product,
    displayBarcode: extractDisplayPlu(product.barcode, scaleConfig),
  };
}

export function filterPluProducts(products = [], scaleConfig = null) {
  return products.filter((p) => isPluProduct(p, scaleConfig)).map((p) => mapPluProduct(p, scaleConfig));
}

/** Decodifica etiqueta EAN-13 de balanza → { plu, weight } o null. */
export function parseScaleBarcode(barcode, scaleConfig = null) {
  const str = String(barcode || '').trim();
  const prefix = String(scaleConfig?.prefix ?? '20');
  const pluLength = Number(scaleConfig?.pluLength ?? 5);
  const weightLength = Number(scaleConfig?.weightLength ?? 5);
  const divisor = Number(scaleConfig?.divisor ?? 1000);
  const expectedLength = prefix.length + pluLength + weightLength + 1;

  if (str.length !== expectedLength || !str.startsWith(prefix)) {
    return null;
  }

  const pluStart = prefix.length;
  const rawPlu = str.substring(pluStart, pluStart + pluLength);
  const plu = rawPlu.replace(/^0+(?!$)/, '') || rawPlu;
  const weightStr = str.substring(pluStart + pluLength, pluStart + pluLength + weightLength);
  const weight = Number(weightStr) / divisor;

  if (!plu || Number.isNaN(weight)) {
    return null;
  }

  return { plu, weight };
}

export function normalizePluCode(code) {
  if (code == null || code === '') return '';
  return String(code).replace(/^0+(?!$)/, '') || String(code);
}
