import { useState, useEffect, useCallback, useMemo } from 'react';
import Swal from 'sweetalert2';
import AuthService from '../services/AuthService';
import PromotionService from '../services/PromotionService';
import { calculateSaleTotals } from '../utils/calculateSaleTotals';
import { formatMoney } from '../utils/formatMoney';
import { loadSettings } from '../utils/settingsStorage';

export const useBillingCart = () => {
  const [cart, setCart] = useState([]);
  const [taxRate, setTaxRate] = useState(() => loadSettings().taxRate);
  const [lastAddedLineId, setLastAddedLineId] = useState(null);

  const canApplyDiscount = AuthService.hasPermission('SALE_DISCOUNT');
  const saleTotals = useMemo(() => calculateSaleTotals(cart, taxRate), [cart, taxRate]);
  const { subtotal, discountTotal, tax, total } = saleTotals;

  useEffect(() => {
    const saved = localStorage.getItem('supernova_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.taxRate !== undefined) setTaxRate(parsed.taxRate);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const rejectInactiveProduct = useCallback((product) => {
    if (product?.isActive === false) {
      Swal.fire({
        icon: 'warning',
        title: 'Producto inactivo',
        text: `"${product.name}" está deshabilitado y no puede venderse.`,
      });
      return true;
    }
    return false;
  }, []);

  const resolvePromoForLine = useCallback(async (productId, quantity, uomConversionId = null) => {
    try {
      const promo = await PromotionService.apply(productId, quantity, uomConversionId);
      if (!promo) {
        return { promo: null, discountAmount: 0 };
      }
      return {
        promo,
        discountAmount: Number(promo.discountAmount || 0),
      };
    } catch (err) {
      console.warn('No se pudo calcular promoción:', err);
      return { promo: null, discountAmount: 0 };
    }
  }, []);

  const notifyPendingBogo = useCallback(async (productId, currentQty) => {
    if (currentQty >= 2) return;
    try {
      const preview = await PromotionService.apply(productId, 2);
      if (preview?.type === 'BOGO') {
        const Toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3500 });
        const missing = Math.max(1, 2 - Math.floor(currentQty));
        Toast.fire({
          icon: 'info',
          title: `2x1: agregue ${missing} u. más (total 2) para activar la promo`,
        });
      }
    } catch (_) {}
  }, []);

  const addToCartWithQuantity = useCallback(async (product, quantity) => {
    if (!product?.id || quantity <= 0) return;
    if (rejectInactiveProduct(product)) return;
    const qty = parseFloat(Number(quantity).toFixed(4));
    const existing = cart.find((item) => item.id === product.id);
    const mergedQty = existing
      ? parseFloat((Number(existing.quantity) + qty).toFixed(4))
      : qty;

    if (mergedQty > product.currentStock) {
      Swal.fire({ icon: 'warning', title: 'Límite', text: `Solo hay ${product.currentStock} en stock.` });
      return;
    }

    const { promo, discountAmount: promoDiscount } = await resolvePromoForLine(product.id, mergedQty, product.uomConversionId);
    const discountAmount = promo
      ? promoDiscount
      : Number(existing?.discountAmount ?? existing?.discount ?? 0);

    setCart((prevCart) => {
      const line = prevCart.find((item) => item.id === product.id);
      if (line) {
        setLastAddedLineId(product.id);
        return prevCart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: mergedQty,
                promo: promo || null,
                discountAmount,
              }
            : item
        );
      }
      setLastAddedLineId(product.id);
      return [
        ...prevCart,
        {
          ...product,
          quantity: mergedQty,
          promo,
          discountAmount,
        },
      ];
    });

    if (promo?.displayLabel) {
      const Toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
      Toast.fire({ icon: 'success', title: `🏷️ ${promo.displayLabel}` });
    } else if (mergedQty < 2) {
      notifyPendingBogo(product.id, mergedQty);
    }
  }, [cart, rejectInactiveProduct, resolvePromoForLine, notifyPendingBogo]);

  const setLineQuantity = async (productId, quantity) => {
    const qty = parseFloat(Number(quantity).toFixed(4));
    if (qty <= 0) return;
    const current = cart.find((item) => item.id === productId);
    if (!current) return;
    if (qty > current.currentStock) {
      Swal.fire({ icon: 'warning', title: 'Límite', text: `Máximo ${current.currentStock} en stock.` });
      return;
    }

    const { promo, discountAmount: promoDiscount } = await resolvePromoForLine(productId, qty, current.uomConversionId);
    const keepManualDiscount = !promo && !current.promo && Number(current.discountAmount || 0) > 0;
    const discountAmount = promo
      ? promoDiscount
      : keepManualDiscount
        ? Number(current.discountAmount || 0)
        : 0;

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId
          ? { ...item, quantity: qty, promo, discountAmount }
          : item
      )
    );
  };

  const removeFromCart = (id) => {
    setCart(prevCart => prevCart.filter((item) => item.id !== id));
  };

  const handleSetLineDiscount = async (id) => {
    if (!canApplyDiscount) {
      Swal.fire({ icon: 'warning', title: 'Permiso requerido', text: 'No tiene permiso para aplicar descuentos.' });
      return;
    }
    const item = cart.find((line) => line.id === id);
    if (!item) return;
    const lineGross = Number(item.salePrice || 0) * Number(item.quantity || 0);
    const currentDiscount = Number(item.discountAmount || 0);
    const { value } = await Swal.fire({
      title: `Descuento: ${item.name}`,
      html: `
        <select id="discount-type" class="swal2-input" style="width:75%">
          <option value="amount">Monto fijo</option>
          <option value="percent">Porcentaje</option>
        </select>
        <input id="discount-value" class="swal2-input" type="number" min="0" step="0.01" value="${currentDiscount}" placeholder="Descuento">
        <p style="font-size:12px;margin-top:6px">Máximo permitido: ${formatMoney(lineGross)}</p>
      `,
      showCancelButton: true,
      confirmButtonText: 'Aplicar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const type = document.getElementById('discount-type')?.value;
        const rawValue = Number(document.getElementById('discount-value')?.value || 0);
        const discount = type === 'percent' ? lineGross * (rawValue / 100) : rawValue;
        if (Number.isNaN(discount) || discount < 0) {
          Swal.showValidationMessage('Ingrese un descuento válido.');
          return false;
        }
        if (discount > lineGross) {
          Swal.showValidationMessage('El descuento no puede superar el importe de la línea.');
          return false;
        }
        return parseFloat(discount.toFixed(4));
      },
    });
    if (value === undefined) return;
    setCart(prevCart => prevCart.map((line) => (line.id === id ? { ...line, discountAmount: value, promo: null } : line)));
  };

  return {
    cart,
    setCart,
    taxRate,
    lastAddedLineId,
    setLastAddedLineId,
    subtotal,
    discountTotal,
    tax,
    total,
    canApplyDiscount,
    rejectInactiveProduct,
    addToCartWithQuantity,
    setLineQuantity,
    removeFromCart,
    handleSetLineDiscount,
  };
};
