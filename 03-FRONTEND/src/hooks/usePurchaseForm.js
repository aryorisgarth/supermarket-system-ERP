import { useState, useCallback } from 'react';
import ProductService from '../services/ProductService';
import PurchaseOrderService from '../services/PurchaseOrderService';
import { normalizeProductList } from '../utils/normalizeProduct';
import { getApiErrorMessage } from '../utils/apiError';
import Swal from 'sweetalert2';

const emptyLine = () => ({
  productId: '',
  productSearch: '',
  purchasePackId: '',
  quantityInPacks: '1',
  costPerPack: '',
});

export const usePurchaseForm = ({ onSuccess }) => {
  const [supplierId, setSupplierId] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([emptyLine()]);
  const [supplierProducts, setSupplierProducts] = useState([]);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const loadSupplierCatalog = useCallback(async (nextSupplierId) => {
    if (!nextSupplierId) {
      setSupplierProducts([]);
      return;
    }
    try {
      const data = await ProductService.getBySupplier(Number(nextSupplierId));
      setSupplierProducts(normalizeProductList(Array.isArray(data) ? data : data?.content || []));
    } catch (error) {
      console.error(error);
      setSupplierProducts([]);
    }
  }, []);

  const openCreate = useCallback((initialSupplier) => {
    setSupplierId(initialSupplier || '');
    setNotes('');
    setItems([emptyLine()]);
    setShowModal(true);
    if (initialSupplier) {
      loadSupplierCatalog(initialSupplier);
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
    return packs.find((pack) => String(pack.id) === String(packId)) || { label: 'UN', factor: 1 };
  }, []);

  const saveOrder = async (event) => {
    if (event) event.preventDefault();
    const validItems = items.filter(
      (item) =>
        item.productId &&
        item.purchasePackId &&
        Number(item.quantityInPacks) > 0 &&
        Number(item.costPerPack) > 0
    );
    if (!supplierId || validItems.length === 0) {
      Swal.fire(
        'Datos incompletos',
        'Selecciona proveedor, productos de su catálogo y presentación de compra.',
        'warning'
      );
      return;
    }

    try {
      setSaving(true);
      await PurchaseOrderService.create({
        supplierId: Number(supplierId),
        notes,
        items: validItems.map((item) => {
          const product = findProduct(item.productId);
          const selectedPack = findPack(product, item.purchasePackId);
          const equivalentConversion = product?.uomConversions?.find(
            (c) => c.label === selectedPack?.label
          );
          return {
            productId: Number(item.productId),
            purchasePackId: Number(item.purchasePackId),
            uomConversionId: equivalentConversion ? equivalentConversion.id : null,
            quantityInPacks: Number(item.quantityInPacks),
            costPerPack: Number(item.costPerPack),
          };
        }),
      });
      setShowModal(false);
      if (onSuccess) await onSuccess();
      Swal.fire({ icon: 'success', title: 'Compra creada', timer: 1400, showConfirmButton: false });
    } catch (error) {
      console.error(error);
      Swal.fire('Error', getApiErrorMessage(error, 'No se pudo crear la compra.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  return {
    showModal,
    setShowModal,
    openCreate,
    formProps: {
      supplierId,
      notes,
      setNotes,
      items,
      setItems,
      saving,
      supplierProducts,
      onSupplierChange: handleSupplierChange,
      onSubmit: saveOrder,
    }
  };
};
