import { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import BillingService from '../services/BillingService';
import ProductService from '../services/ProductService';
import { normalizeProduct } from '../utils/normalizeProduct';

import { useBillingCart } from './useBillingCart';
import { useBillingProductSearch } from './useBillingProductSearch';
import { useBillingCheckout } from './useBillingCheckout';

export const useBilling = () => {
  const [billingConfig, setBillingConfig] = useState(null);
  const [showQuickAccess, setShowQuickAccess] = useState(true);

  const [entryMode, setEntryMode] = useState('idle');
  const [pendingProduct, setPendingProduct] = useState(null);
  const [selectedLineId, setSelectedLineId] = useState(null);
  const [entryQty, setEntryQty] = useState('1');

  const cartData = useBillingCart();

  const [paymentAccounts, setPaymentAccounts] = useState([]);

  const loadPaymentAccounts = useCallback(async () => {
    try {
      const accounts = await BillingService.getPaymentAccounts();
      setPaymentAccounts(accounts?.filter(a => a.isActive) || []);
    } catch (error) {
      console.warn('Cuentas de pago no disponibles:', error);
    }
  }, []);

  const loadBillingConfig = useCallback(async () => {
    try {
      const config = await BillingService.getConfig();
      setBillingConfig(config);
    } catch (error) {
      console.warn('Configuración de facturación no disponible:', error);
    }
  }, []);

  const clearEntry = useCallback(() => {
    setEntryMode('idle');
    setPendingProduct(null);
    setSelectedLineId(null);
    setEntryQty('1');
  }, []);

  const startAddProduct = useCallback((product) => {
    if (!product?.id) return;
    if (cartData.rejectInactiveProduct(product)) return;
    if (product.currentStock <= 0) {
      Swal.fire({ icon: 'error', title: 'Sin stock', text: `"${product.name}" no tiene existencias.` });
      return;
    }
    setSelectedLineId(null);
    setPendingProduct(product);
    setEntryMode('add');
    setEntryQty('1');
    setTimeout(() => document.getElementById('pos-entry-qty')?.focus(), 50);
  }, [cartData]);

  const selectCartLine = (id) => {
    const item = cartData.cart.find((i) => i.id === id);
    if (!item) return;
    setPendingProduct(null);
    setSelectedLineId(id);
    setEntryMode('edit');
    setEntryQty(String(item.quantity));
    setTimeout(() => document.getElementById('pos-entry-qty')?.focus(), 50);
  };

  const confirmEntry = () => {
    const qty = parseFloat(String(entryQty).replace(',', '.'));
    if (Number.isNaN(qty) || qty <= 0) return;
    if (entryMode === 'add' && pendingProduct) {
      cartData.addToCartWithQuantity(pendingProduct, qty);
      const name = pendingProduct.name;
      clearEntry();
      const Toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 900 });
      Toast.fire({ icon: 'success', title: `Agregado: ${name}` });
    } else if (entryMode === 'edit' && selectedLineId) {
      cartData.setLineQuantity(selectedLineId, qty);
      clearEntry();
    }
  };

  const searchData = useBillingProductSearch(cartData.addToCartWithQuantity, startAddProduct);

  const checkoutData = useBillingCheckout({
    cart: cartData.cart,
    setCart: cartData.setCart,
    total: cartData.total,
    subtotal: cartData.subtotal,
    discountTotal: cartData.discountTotal,
    tax: cartData.tax,
    taxRate: cartData.taxRate,
    loadProducts: searchData.loadProducts,
    clearEntry,
  });

  useEffect(() => {
    loadBillingConfig();
    loadPaymentAccounts();
    searchData.loadProducts();
    searchData.loadCategories();
  }, [loadBillingConfig, loadPaymentAccounts, searchData.loadProducts, searchData.loadCategories]);

  const handleKeyDown = async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const code = searchData.searchQuery.trim();
      if (!code) return;

      try {
        searchData.setLoading(true);
        let foundProduct = null;
        const isLikelyBarcode = code.length >= 4 && /^[a-zA-Z0-9_-]{3,}$/.test(code);

        if (isLikelyBarcode) {
          try {
            foundProduct = normalizeProduct(await ProductService.getByBarcode(code));
          } catch (err) {
            console.warn('Barcode not found, falling back to name search');
          }
        }

        if (!foundProduct) {
          const strippedCode = code.replace(/^0+/, '');
          const matches = searchData.products.filter(p => 
            p.barcode === code || 
            (p.barcode && p.barcode.replace(/^0+/, '') === strippedCode) ||
            p.name?.toLowerCase().includes(code.toLowerCase())
          );
          if (matches.length > 0) foundProduct = matches[0];
        }

        if (foundProduct) {
          if (foundProduct.isActive === false) {
            Swal.fire({ icon: 'warning', title: 'Producto Inactivo', text: 'El producto está deshabilitado.' });
            return;
          }
          if (foundProduct.currentStock <= 0) {
            Swal.fire({ icon: 'error', title: 'Sin Stock', text: `"${foundProduct.name}" no tiene existencias.` });
            return;
          }
          searchData.setSearchQuery('');
          if (isLikelyBarcode) {
            const qty = foundProduct.prefilledQuantity != null ? Number(foundProduct.prefilledQuantity) : 1;
            cartData.addToCartWithQuantity(foundProduct, qty);
            const Toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 1000 });
            Toast.fire({ icon: 'success', title: `Añadido: ${foundProduct.name}` });
          } else {
            startAddProduct(foundProduct);
          }
        } else {
          Swal.fire({ icon: 'warning', title: 'No Encontrado', text: 'No se encontró producto por código o nombre.', confirmButtonColor: '#10b981' });
        }
      } catch (error) { 
        console.error('Error de escáner:', error);
      } finally { 
        searchData.setLoading(false); 
      }
    }
  };

  const handleCancelCurrentPurchase = useCallback(async () => {
    if (cartData.cart.length === 0 && checkoutData.payments.length === 0 && !checkoutData.selectedCustomer && checkoutData.amountReceived <= 0) return;
    const res = await Swal.fire({
      title: '¿Cancelar compra actual?',
      text: 'Se limpiará el carrito, cliente, pagos y efectivo recibido. No se anula ninguna venta ya registrada.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar compra',
      cancelButtonText: 'Volver',
      confirmButtonColor: '#dc2626',
    });
    if (!res.isConfirmed) return;
    cartData.setCart([]);
    checkoutData.cancelCheckoutState();
    clearEntry();
  }, [cartData, checkoutData, clearEntry]);

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.key === 'F12' || e.key === 'F10') { 
        e.preventDefault(); 
        if (cartData.cart.length > 0) checkoutData.handleCheckout(); 
      }
      if (e.key === 'F2') {
        e.preventDefault();
        document.getElementById('pos-search-input')?.focus();
      }
      if (e.key === 'F4') {
        e.preventDefault();
        setShowQuickAccess(p => !p);
      }
      if (e.key === 'F8') {
        e.preventDefault();
        checkoutData.setIsMultiPayment(p => !p);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [cartData.cart, checkoutData]);

  const getDynamicCountryLabel = () => {
    const saved = localStorage.getItem('supernova_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.country === 'NI') return 'Nicaragua';
        if (parsed.country === 'GT') return 'Guatemala';
        if (parsed.country === 'MX') return 'México';
        if (parsed.country === 'USD') return 'Estados Unidos';
      } catch (e) {}
    }
    return billingConfig?.countryLabel || 'Guatemala';
  };

  const entryBarProduct = entryMode === 'edit' ? cartData.cart.find((i) => i.id === selectedLineId) : pendingProduct;

  return {
    cart: cartData.cart,
    searchQuery: searchData.searchQuery,
    products: searchData.products,
    loading: searchData.loading,
    paymentMethod: checkoutData.paymentMethod,
    taxRate: cartData.taxRate,
    billingConfig,
    categories: searchData.categories,
    selectedCategory: searchData.selectedCategory,
    categoryProducts: searchData.categoryProducts,
    loadingCategoryProducts: searchData.loadingCategoryProducts,
    showCategoryProductsModal: searchData.showCategoryProductsModal,
    entryMode,
    pendingProduct,
    selectedLineId,
    entryQty,
    lastAddedLineId: cartData.lastAddedLineId,
    selectedCustomer: checkoutData.selectedCustomer,
    amountReceived: checkoutData.amountReceived,
    isMultiPayment: checkoutData.isMultiPayment,
    payments: checkoutData.payments,
    couponCode: checkoutData.couponCode,
    validatingCoupon: checkoutData.validatingCoupon,
    showReceipt: checkoutData.showReceipt,
    receiptData: checkoutData.receiptData,
    showPrintButton: checkoutData.showPrintButton,
    showQuickAccess,
    transferBank: checkoutData.transferBank,
    transferRef: checkoutData.transferRef,
    paymentAccounts,
    
    subtotal: cartData.subtotal,
    discountTotal: cartData.discountTotal,
    tax: cartData.tax,
    total: cartData.total,
    canApplyDiscount: cartData.canApplyDiscount,
    entryBarProduct,
    
    setSearchQuery: searchData.setSearchQuery,
    setEntryQty,
    setSelectedCustomer: checkoutData.setSelectedCustomer,
    setPayments: checkoutData.setPayments,
    setPaymentMethod: checkoutData.setPaymentMethod,
    setAmountReceived: checkoutData.setAmountReceived,
    setCouponCode: checkoutData.setCouponCode,
    setIsMultiPayment: checkoutData.setIsMultiPayment,
    setShowQuickAccess,
    setTransferBank: checkoutData.setTransferBank,
    setTransferRef: checkoutData.setTransferRef,
    setShowReceipt: checkoutData.setShowReceipt,
    setShowCategoryProductsModal: searchData.setShowCategoryProductsModal,
    
    handleSearch: searchData.handleSearch,
    handleKeyDown,
    handleCategoryClick: searchData.handleCategoryClick,
    selectCartLine,
    removeFromCart: cartData.removeFromCart,
    handleSetLineDiscount: cartData.handleSetLineDiscount,
    handleCancelCurrentPurchase,
    confirmEntry,
    clearEntry,
    handleValidateCoupon: checkoutData.handleValidateCoupon,
    handleCheckout: checkoutData.handleCheckout,
    handlePrintReceipt: () => checkoutData.setShowReceipt(true),
    handleReprintTicket: checkoutData.handleReprintTicket,
    handleEditSale: checkoutData.handleEditSale,
    handleCancelSale: checkoutData.handleCancelSale,
    handleCategoryQuickAdd: searchData.handleCategoryQuickAdd,
    handleCategoryQuantityEdit: searchData.handleCategoryQuantityEdit,
    getDynamicCountryLabel,
  };
};
export default useBilling;
