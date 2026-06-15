import { useState, useCallback, useMemo, useEffect } from 'react';
import PurchaseOrderService from '../services/PurchaseOrderService';
import SupplierService from '../services/SupplierService';
import Swal from 'sweetalert2';
import { getApiErrorMessage } from '../utils/apiError';

export const usePurchaseList = ({ reload }) => {
  const [allOrders, setAllOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [metaLoading, setMetaLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const loadMeta = useCallback(async () => {
    setMetaLoading(true);
    const [ordersResult, suppliersResult] = await Promise.allSettled([
      PurchaseOrderService.getAll(),
      SupplierService.getAll(),
    ]);

    if (ordersResult.status === 'fulfilled') {
      setAllOrders(ordersResult.value || []);
    } else {
      console.error(ordersResult.reason);
    }

    if (suppliersResult.status === 'fulfilled') {
      setSuppliers(suppliersResult.value || []);
    } else {
      console.error(suppliersResult.reason);
    }

    if ([ordersResult, suppliersResult].some((result) => result.status === 'rejected')) {
      Swal.fire('Error', 'No se pudieron cargar algunos datos del modulo de compras.', 'warning');
    }

    setMetaLoading(false);
  }, []);

  useEffect(() => {
    loadMeta();
  }, [loadMeta]);

  const refreshAll = useCallback(async () => {
    await Promise.all([reload(), loadMeta()]);
  }, [reload, loadMeta]);

  const summary = useMemo(() => {
    const activeOrders = allOrders.filter((order) => order.status !== 'CANCELLED');
    const pendingOrders = allOrders.filter((order) => ['DRAFT', 'ORDERED', 'PARTIALLY_RECEIVED'].includes(order.status));
    const receivedOrders = allOrders.filter((order) => order.status === 'RECEIVED');
    const pendingAmount = pendingOrders.reduce((sum, order) => sum + Number(order.subtotal || 0), 0);
    const receivedAmount = receivedOrders.reduce((sum, order) => sum + Number(order.subtotal || 0), 0);
    return {
      activeCount: activeOrders.length,
      pendingCount: pendingOrders.length,
      partialCount: allOrders.filter((order) => order.status === 'PARTIALLY_RECEIVED').length,
      receivedCount: receivedOrders.length,
      pendingAmount,
      receivedAmount,
    };
  }, [allOrders]);

  const handleSelectOrder = async (orderSummary) => {
    if (!orderSummary) {
      setSelectedOrder(null);
      return;
    }
    try {
      const fullOrder = await PurchaseOrderService.getById(orderSummary.id);
      setSelectedOrder(fullOrder);
    } catch (e) {
      console.error(e);
      Swal.fire('Error', 'No se pudieron cargar los detalles de la compra.', 'error');
    }
  };

  const runAction = async (order, action, label) => {
    const result = await Swal.fire({
      title: label,
      text: `${order.orderNumber} - ${order.supplierName}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
    });
    if (!result.isConfirmed) return;

    try {
      if (action === 'order') await PurchaseOrderService.markOrdered(order.id);
      if (action === 'cancel') await PurchaseOrderService.cancel(order.id);
      await refreshAll();
      Swal.fire({ icon: 'success', title: 'Actualizado', timer: 1200, showConfirmButton: false });
    } catch (error) {
      console.error(error);
      Swal.fire('Error', getApiErrorMessage(error, 'No se pudo actualizar la compra.'), 'error');
    }
  };

  return {
    allOrders,
    suppliers,
    metaLoading,
    selectedOrder,
    setSelectedOrder,
    summary,
    handleSelectOrder,
    runAction,
    refreshAll,
  };
};
