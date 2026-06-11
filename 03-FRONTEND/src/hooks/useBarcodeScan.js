import { useCallback, useState } from 'react';
import ProductService from '../services/ProductService';
import { normalizeProduct } from '../utils/normalizeProduct';

const BARCODE_PATTERN = /^[a-zA-Z0-9_-]{3,}$/;

/**
 * Hook reutilizable para escaneo por código de barras (lector USB o teclado).
 * Enter dispara la búsqueda; devuelve el producto normalizado o null.
 */
export default function useBarcodeScan({ onFound, onNotFound, onError } = {}) {
  const [scanValue, setScanValue] = useState('');
  const [scanning, setScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState(null);

  const lookupBarcode = useCallback(async (rawCode) => {
    const code = String(rawCode || '').trim();
    if (!code) return null;

    setScanning(true);
    try {
      let product = null;
      if (BARCODE_PATTERN.test(code)) {
        try {
          product = normalizeProduct(await ProductService.getByBarcode(code));
        } catch {
          product = null;
        }
      }
      if (!product) {
        const results = await ProductService.search(code);
        const list = Array.isArray(results) ? results : results?.content || [];
        product = list.length ? normalizeProduct(list[0]) : null;
      }

      if (product) {
        setLastScanned(product);
        onFound?.(product, code);
        return product;
      }

      setLastScanned(null);
      onNotFound?.(code);
      return null;
    } catch (error) {
      onError?.(error);
      return null;
    } finally {
      setScanning(false);
    }
  }, [onFound, onNotFound, onError]);

  const handleScanKeyDown = useCallback(async (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    const product = await lookupBarcode(scanValue);
    if (product) {
      setScanValue('');
    }
    return product;
  }, [lookupBarcode, scanValue]);

  const clearScan = useCallback(() => {
    setScanValue('');
    setLastScanned(null);
  }, []);

  return {
    scanValue,
    setScanValue,
    scanning,
    lastScanned,
    lookupBarcode,
    handleScanKeyDown,
    clearScan,
  };
}
