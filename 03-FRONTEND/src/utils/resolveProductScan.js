import ProductService from '../services/ProductService';
import ScaleConfigService from '../services/ScaleConfigService';
import { normalizeProduct } from './normalizeProduct';
import {
  DEFAULT_SCALE_CONFIG,
  isScaleEanBarcode,
  normalizePluCode,
  parseScaleBarcodeWithFallback,
  sanitizeScanCode,
} from './pluProductUtils';

let cachedScaleConfig = null;

export async function getScaleConfigForScan() {
  if (cachedScaleConfig) return cachedScaleConfig;
  try {
    cachedScaleConfig = await ScaleConfigService.getConfig();
  } catch {
    cachedScaleConfig = DEFAULT_SCALE_CONFIG;
  }
  return cachedScaleConfig;
}

export function clearScaleConfigCache() {
  cachedScaleConfig = null;
}

function attachWeight(product, scaleParsed) {
  if (!product) return null;
  const weight = scaleParsed?.weight ?? product.prefilledQuantity ?? product.prefilled_quantity;
  if (weight == null || Number.isNaN(Number(weight))) return product;
  return { ...product, prefilledQuantity: Number(weight) };
}

/**
 * Resuelve producto escaneado en POS.
 * Etiquetas de balanza (EAN-13 prefijo 20): extrae PLU + peso, nunca busca el EAN completo en BD local.
 */
export async function resolveProductByScanCode(code, localProducts = []) {
  const scannedCode = sanitizeScanCode(code);
  if (!scannedCode) {
    return { product: null, scaleParsed: null, lookupCode: null, scannedCode: '' };
  }

  const scaleConfig = await getScaleConfigForScan();
  const prefix = scaleConfig?.prefix ?? DEFAULT_SCALE_CONFIG.prefix;
  const scaleParsed = parseScaleBarcodeWithFallback(scannedCode, scaleConfig);
  const isScaleLabel = Boolean(scaleParsed) || isScaleEanBarcode(scannedCode, prefix);

  const lookupCodes = [];
  if (isScaleLabel) {
    lookupCodes.push(scannedCode);
    if (scaleParsed?.plu) lookupCodes.push(scaleParsed.plu);
  } else {
    lookupCodes.push(scannedCode);
  }

  for (const lookupCode of [...new Set(lookupCodes)]) {
    try {
      const product = attachWeight(
        normalizeProduct(await ProductService.getByBarcode(lookupCode)),
        scaleParsed,
      );
      return { product, scaleParsed, lookupCode, scannedCode };
    } catch {
      /* siguiente candidato */
    }
  }

  if (scaleParsed?.plu) {
    const local = localProducts.find(
      (p) => p?.barcode && normalizePluCode(p.barcode) === scaleParsed.plu,
    );
    if (local) {
      return {
        product: attachWeight(local, scaleParsed),
        scaleParsed,
        lookupCode: scaleParsed.plu,
        scannedCode,
      };
    }
  }

  const stripped = normalizePluCode(scannedCode);
  const local = localProducts.find((p) => {
    if (!p?.barcode) return false;
    const stored = normalizePluCode(p.barcode);
    return p.barcode === scannedCode || stored === stripped;
  });
  if (local) {
    return { product: local, scaleParsed, lookupCode: scannedCode, scannedCode };
  }

  try {
    const results = await ProductService.search(scannedCode);
    const list = Array.isArray(results) ? results : results?.content || [];
    if (list.length) {
      return {
        product: attachWeight(normalizeProduct(list[0]), scaleParsed),
        scaleParsed,
        lookupCode: scannedCode,
        scannedCode,
      };
    }
  } catch {
    /* ignore */
  }

  return { product: null, scaleParsed, lookupCode: lookupCodes[0] ?? scannedCode, scannedCode };
}
