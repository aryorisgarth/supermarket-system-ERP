import { useCallback, useState } from 'react';
import { resolveProductByScanCode } from '../utils/resolveProductScan';

export default function useBarcodeScan({ onFound, onNotFound, onError } = {}) {
  const [scanValue, setScanValue] = useState('');
  const [scanning, setScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState(null);

  const lookupBarcode = useCallback(async (rawCode, localProducts = []) => {
    const code = String(rawCode || '').trim();
    if (!code) return null;

    setScanning(true);
    try {
      const { product } = await resolveProductByScanCode(code, localProducts);
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
