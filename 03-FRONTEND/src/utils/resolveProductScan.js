import ProductService from '../services/ProductService';
import ScaleConfigService from '../services/ScaleConfigService';
import { normalizeProduct } from './normalizeProduct';
import { isScaleEanBarcode, normalizePluCode, parseScaleBarcode } from './pluProductUtils';

const DEFAULT_SCALE_CONFIG = {
  prefix: '20',
  pluLength: 5,
  weightLength: 5,
  divisor: 1000,
};

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

/**
 * Resuelve producto escaneado en POS.
 * Etiquetas de balanza (13 dígitos, prefijo 20): extrae PLU + peso, nunca busca el EAN completo.
 */
export async function resolveProductByScanCode(code, localProducts = []) {
  const trimmed = String(code || '').trim();
  if (!trimmed) {
    return { product: null, scaleParsed: null, lookupCode: null };
  }

  const scaleConfig = await getScaleConfigForScan();
  const isScaleLabel = isScaleEanBarcode(trimmed, scaleConfig.prefix ?? '20');
  const scaleParsed = isScaleLabel ? parseScaleBarcode(trimmed, scaleConfig) : null;

  if (scaleParsed?.plu) {
    const lookupCode = scaleParsed.plu;
    try {
      const product = normalizeProduct(await ProductService.getByBarcode(lookupCode));
      return {
        product: { ...product, prefilledQuantity: scaleParsed.weight },
        scaleParsed,
        lookupCode,
      };
    } catch {
      const local = localProducts.find(
        (p) => p?.barcode && normalizePluCode(p.barcode) === lookupCode,
      );
      if (local) {
        return {
          product: { ...local, prefilledQuantity: scaleParsed.weight },
          scaleParsed,
          lookupCode,
        };
      }
      return { product: null, scaleParsed, lookupCode };
    }
  }

  try {
    const product = normalizeProduct(await ProductService.getByBarcode(trimmed));
    return { product, scaleParsed: null, lookupCode: trimmed };
  } catch {
    const stripped = normalizePluCode(trimmed);
    const local = localProducts.find((p) => {
      if (!p?.barcode) return false;
      const stored = normalizePluCode(p.barcode);
      return p.barcode === trimmed || stored === stripped;
    });
    if (local) {
      return { product: local, scaleParsed: null, lookupCode: trimmed };
    }
    try {
      const results = await ProductService.search(trimmed);
      const list = Array.isArray(results) ? results : results?.content || [];
      if (list.length) {
        return { product: normalizeProduct(list[0]), scaleParsed: null, lookupCode: trimmed };
      }
    } catch {
      /* ignore */
    }
    return { product: null, scaleParsed: null, lookupCode: trimmed };
  }
}
