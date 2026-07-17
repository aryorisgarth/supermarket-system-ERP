(function (global) {
  function isWeightUom(uom) {
    const u = String(uom || 'UN').trim().toUpperCase();
    return u === 'LB' || u === 'KG' || u === 'GR' || u === 'G' || u === 'OZ';
  }

  function isShortPluBarcode(barcode) {
    if (barcode == null || barcode === '') return false;
    const str = String(barcode).trim();
    if (str.length === 13 && /^\d{13}$/.test(str)) return false;
    const stripped = str.replace(/^0+/, '') || str;
    if (/^\d+$/.test(stripped)) return stripped.length > 0 && stripped.length <= 6;
    return str.length > 0 && str.length <= 6;
  }

  function isScaleEanBarcode(barcode, prefix) {
    const str = String(barcode || '').trim();
    const p = String(prefix || '20');
    return str.length === 13 && str.startsWith(p);
  }

  function isPluProduct(product, scaleConfig) {
    if (!product || !product.barcode) return false;
    if (product.isActive === false) return false;
    const prefix = (scaleConfig && scaleConfig.prefix) || '20';
    if (isWeightUom(product.uomBase)) return true;
    if (isShortPluBarcode(product.barcode)) return true;
    if (isScaleEanBarcode(product.barcode, prefix)) return true;
    return false;
  }

  function extractDisplayPlu(barcode, scaleConfig) {
    const str = String(barcode || '').trim();
    const prefix = (scaleConfig && scaleConfig.prefix) || '20';
    const pluLength = Number((scaleConfig && scaleConfig.pluLength) || 5);
    if (isScaleEanBarcode(str, prefix)) {
      const pluStart = prefix.length;
      const raw = str.substring(pluStart, pluStart + pluLength);
      return raw.replace(/^0+/, '') || raw;
    }
    return str.replace(/^0+/, '') || str;
  }

  global.PluUtils = {
    isWeightUom,
    isShortPluBarcode,
    isScaleEanBarcode,
    isPluProduct,
    extractDisplayPlu,
  };
})(window);
