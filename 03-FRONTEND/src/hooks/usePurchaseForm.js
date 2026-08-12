import { useState, useCallback } from 'react';
import ProductService from '../services/ProductService';
import PurchaseOrderService from '../services/PurchaseOrderService';
import { normalizeProductList } from '../utils/normalizeProduct';
import { getApiErrorMessage } from '../utils/apiError';
import {
  getDefaultPurchasePack,
  getPricingPolicy,
  suggestCostPerPack,
  suggestSalePricesForPack,
} from '../utils/purchaseUnits';
import Swal from 'sweetalert2';

const emptyLine = () => ({
  productId: '',
  productSearch: '',
  purchasePackId: '',
  quantityInPacks: '1',
  costPerPack: '',
  salePricePerPack: '',
  salePricePerUnit: '',
  salePriceTouched: false,
});

const optionalPositive = (value) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
};

export const usePurchaseForm = ({ onSuccess }) => {
  const [supplierId, setSupplierId] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([emptyLine()]);
  const [supplierProducts, setSupplierProducts] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState(null);

  const loadSupplierCatalog = useCallback(async (nextSupplierId) => {
    if (!nextSupplierId) {
      setSupplierProducts([]);
      setCatalogLoading(false);
      return [];
    }

    setCatalogLoading(true);
    try {
      const bySupplier = await ProductService.getBySupplier(Number(nextSupplierId));
      let products = normalizeProductList(Array.isArray(bySupplier) ? bySupplier : []);

      if (products.length === 0) {
        const pageSize = 500;
        const firstPage = await ProductService.getInventoryPage({
          supplierId: Number(nextSupplierId),
          size: pageSize,
          page: 0,
          sort: 'name,asc',
        });
        products = normalizeProductList(firstPage.content || []);
        const totalPages = firstPage.totalPages || 1;

        for (let page = 1; page < totalPages; page += 1) {
          const nextPage = await ProductService.getInventoryPage({
            supplierId: Number(nextSupplierId),
            size: pageSize,
            page,
            sort: 'name,asc',
          });
          products = products.concat(normalizeProductList(nextPage.content || []));
        }
      }

      products = products.filter((product) => product.isActive !== false);
      setSupplierProducts(products);
      return products;
    } catch (error) {
      console.error(error);
      setSupplierProducts([]);
      return [];
    } finally {
      setCatalogLoading(false);
    }
  }, []);

  const openCreate = useCallback((initialSupplier) => {
    setEditingOrderId(null);
    setSupplierId(initialSupplier || '');
    setNotes('');
    setItems([emptyLine()]);
    setShowModal(true);
    if (initialSupplier) {
      loadSupplierCatalog(initialSupplier);
    }
  }, [loadSupplierCatalog]);

  const openEdit = useCallback(async (orderSummary) => {
    try {
      const order = await PurchaseOrderService.getById(orderSummary.id);
      if (order.status !== 'DRAFT') {
        Swal.fire('No editable', 'Solo se pueden editar órdenes en borrador.', 'warning');
        return;
      }
      const nextSupplierId = String(order.supplierId || '');
      setEditingOrderId(order.id);
      setSupplierId(nextSupplierId);
      setNotes(order.notes || '');
      const products = await loadSupplierCatalog(nextSupplierId);

      const mappedItems = (order.items || []).map((item) => {
        const product = products.find((p) => String(p.id) === String(item.product?.id));
        const packs = product?.purchasePacks || [];
        const pack =
          packs.find((p) => p.label === item.packLabel) ||
          packs.find((p) => Number(p.factor) === Number(item.unitsPerPack)) ||
          packs[0];
        const factor = Number(item.unitsPerPack || pack?.factor || 1) || 1;
        const costPerPack = Number(item.costPerPack ?? item.unitCost ?? 0);
        const suggested = suggestSalePricesForPack(product, pack || { factor }, costPerPack);
        const policy = getPricingPolicy(product);
        const useMarginPreview = policy === 'AUTO_BY_MARGIN' || policy === 'SUGGEST_ON_PURCHASE';
        const saleUnit = useMarginPreview
          ? Number(suggested.salePricePerUnit || 0)
          : Number(item.salePricePerUnit || suggested.salePricePerUnit || 0);
        const salePack = useMarginPreview
          ? Number(suggested.salePricePerPack || 0)
          : Number(item.salePricePerPack || suggested.salePricePerPack || saleUnit * factor);
        return {
          productId: String(item.product?.id || ''),
          productSearch: item.product?.name || product?.name || '',
          purchasePackId: pack?.id ? String(pack.id) : '',
          quantityInPacks: String(item.quantityInPacks ?? item.quantityOrdered ?? '1'),
          costPerPack: String(item.costPerPack ?? item.unitCost ?? ''),
          salePricePerUnit: saleUnit > 0 ? String(saleUnit) : '',
          salePricePerPack: salePack > 0 ? String(salePack) : '',
          salePriceTouched: !useMarginPreview && Boolean(item.salePricePerUnit || item.salePricePerPack),
        };
      });
      setItems(mappedItems.length ? mappedItems : [emptyLine()]);
      setShowModal(true);
    } catch (error) {
      console.error(error);
      Swal.fire('Error', getApiErrorMessage(error, 'No se pudo cargar la orden para editar.'), 'error');
    }
  }, [loadSupplierCatalog]);

  const handleSupplierChange = useCallback((nextSupplierId) => {
    setSupplierId(nextSupplierId);
    setItems([emptyLine()]);
    loadSupplierCatalog(nextSupplierId);
  }, [loadSupplierCatalog]);

  const findProduct = useCallback(
    (productId) => supplierProducts.find((product) => String(product.id) === String(productId)),
    [supplierProducts]
  );

  const findPack = useCallback((product, packId) => {
    const packs = product?.purchasePacks || [];
    return packs.find((pack) => String(pack.id) === String(packId)) || getDefaultPurchasePack(product);
  }, []);

  const saveOrder = async (event) => {
    if (event) event.preventDefault();
    const baseValid = items.filter(
      (item) =>
        item.productId &&
        item.purchasePackId &&
        Number(item.quantityInPacks) > 0 &&
        Number(item.costPerPack) > 0
    );

    // MANUAL: si pone un precio de venta, debe completar unidad y empaque.
    const incompleteManualSale = baseValid.some((item) => {
      const product = findProduct(item.productId);
      if (getPricingPolicy(product) !== 'MANUAL') return false;
      const hasUnit = Number(item.salePricePerUnit) > 0;
      const hasPack = Number(item.salePricePerPack) > 0;
      return hasUnit !== hasPack;
    });

    if (!supplierId || baseValid.length === 0 || incompleteManualSale) {
      Swal.fire(
        'Datos incompletos',
        incompleteManualSale
          ? 'En política Manual completa ambos precios de venta (unidad y empaque) o déjalos vacíos para no cambiar la venta.'
          : 'Completa proveedor, producto, empaque y costo de compra.',
        'warning'
      );
      return;
    }

    const payload = {
      supplierId: Number(supplierId),
      notes,
      items: baseValid.map((item) => {
        const product = findProduct(item.productId);
        const selectedPack = findPack(product, item.purchasePackId);
        const equivalentConversion = product?.uomConversions?.find(
          (c) => c.label === selectedPack?.label
        );
        const policy = getPricingPolicy(product);
        // AUTO recalcula en recepción; SUGGEST no aplica venta. Solo MANUAL envía precios opcionales.
        const saleUnit = policy === 'MANUAL' ? optionalPositive(item.salePricePerUnit) : null;
        const salePack = policy === 'MANUAL' ? optionalPositive(item.salePricePerPack) : null;
        return {
          productId: Number(item.productId),
          purchasePackId: Number(item.purchasePackId),
          uomConversionId: equivalentConversion ? equivalentConversion.id : null,
          quantityInPacks: Number(item.quantityInPacks),
          costPerPack: Number(item.costPerPack),
          salePricePerPack: salePack,
          salePricePerUnit: saleUnit,
        };
      }),
    };

    try {
      setSaving(true);
      const wasEditing = Boolean(editingOrderId);
      if (editingOrderId) {
        await PurchaseOrderService.updateDraft(editingOrderId, payload);
      } else {
        await PurchaseOrderService.create(payload);
      }
      setShowModal(false);
      setEditingOrderId(null);
      if (onSuccess) await onSuccess();
      Swal.fire({
        icon: 'success',
        title: wasEditing ? 'Compra actualizada' : 'Compra creada',
        text: 'Al recibir en bodega se actualiza el costo. El precio de venta depende de la política de cada producto (manual / sugerido / automático por markup).',
        timer: 2200,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error(error);
      Swal.fire('Error', getApiErrorMessage(error, 'No se pudo guardar la compra.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  return {
    showModal,
    setShowModal,
    openCreate,
    openEdit,
    editingOrderId,
    formProps: {
      supplierId,
      notes,
      setNotes,
      items,
      setItems,
      saving,
      supplierProducts,
      catalogLoading,
      onSupplierChange: handleSupplierChange,
      onSubmit: saveOrder,
      isEditing: Boolean(editingOrderId),
    },
  };
};
