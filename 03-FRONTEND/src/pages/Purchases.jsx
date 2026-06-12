import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, Plus, Search } from 'lucide-react';
import Swal from 'sweetalert2';

import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Card, { CardHeader } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import BackendPagination from '../components/ui/BackendPagination';

import PurchaseOrderService from '../services/PurchaseOrderService';
import ProductService from '../services/ProductService';
import SupplierService from '../services/SupplierService';
import AuthService from '../services/AuthService';

import useBackendList from '../hooks/useBackendList';
import { normalizeProductList } from '../utils/normalizeProduct';
import { formatMoney } from '../utils/formatMoney';
import { getApiErrorMessage } from '../utils/apiError';
import { PURCHASE_STATUS_LABELS } from '../utils/purchaseReceipt';

import PurchaseMetrics from '../components/purchase/PurchaseMetrics';
import PurchaseOrderTable from '../components/purchase/PurchaseOrderTable';
import PurchaseDetailModal from '../components/purchase/PurchaseDetailModal';
import PurchaseFormModal from '../components/purchase/PurchaseFormModal';

const emptyLine = () => ({
  productId: '',
  productSearch: '',
  purchasePackId: '',
  quantityInPacks: '1',
  costPerPack: '',
});

const money = formatMoney;

const Purchases = () => {
  const navigate = useNavigate();
  const [allOrders, setAllOrders] = useState([]);
  const [supplierProducts, setSupplierProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [metaLoading, setMetaLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [supplierFilter, setSupplierFilter] = useState('ALL');

  const buildParams = useCallback(() => ({
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    supplierId: supplierFilter === 'ALL' ? undefined : Number(supplierFilter),
  }), [statusFilter, supplierFilter]);

  const loadPage = useCallback((params) => PurchaseOrderService.getPage(params), []);
  const {
    items: orders,
    loading,
    searchTerm,
    setSearchTerm,
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    reload,
    indexOfFirstItem,
    indexOfLastItem,
    handlePageChange,
    handleItemsPerPageChange,
  } = useBackendList({
    loadPage,
    buildParams,
    filterDeps: [statusFilter, supplierFilter],
    sort: 'createdAt,desc',
  });

  const [supplierId, setSupplierId] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([emptyLine()]);

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

  useEffect(() => {
    loadMeta();
  }, []);

  const loadMeta = async () => {
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
  };

  const refreshAll = async () => {
    await Promise.all([reload(), loadMeta()]);
  };

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

  const canManagePurchases = AuthService.hasPermission('PURCHASE_MANAGE');
  const canReceivePurchases = AuthService.hasPermission('PURCHASE_RECEIVE');

  const openCreate = () => {
    const initialSupplier = suppliers[0]?.id || '';
    setSupplierId(initialSupplier);
    setNotes('');
    setItems([emptyLine()]);
    setSelectedOrder(null);
    setShowModal(true);
    loadSupplierCatalog(initialSupplier);
  };

  const handleSupplierChange = (nextSupplierId) => {
    setSupplierId(nextSupplierId);
    setItems([emptyLine()]);
    loadSupplierCatalog(nextSupplierId);
  };

  const findProduct = useCallback(
    (productId) => supplierProducts.find((product) => String(product.id) === String(productId)),
    [supplierProducts]
  );

  const findPack = useCallback((product, packId) => {
    const packs = product?.purchasePacks || [];
    return packs.find((pack) => String(pack.id) === String(packId)) || { label: 'UN', factor: 1 };
  }, []);

  const saveOrder = async (event) => {
    event.preventDefault();
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
        'Selecciona proveedor, productos de su catalogo y presentacion de compra (caja/cajilla/unidad).',
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
      await refreshAll();
      Swal.fire({ icon: 'success', title: 'Compra creada', timer: 1400, showConfirmButton: false });
    } catch (error) {
      console.error(error);
      Swal.fire('Error', getApiErrorMessage(error, 'No se pudo crear la compra.'), 'error');
    } finally {
      setSaving(false);
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

  const openWarehouseReceive = (order) => {
    navigate(`/bodega/recepcion/${order.id}`, { state: { from: 'purchases' } });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        eyebrow="Compras"
        title="Ordenes de compra"
        description="Ordenes al proveedor por empaque (caja/cajilla). La recepcion fisica con escaneo se hace en bodega."
        actions={
          canManagePurchases && (
            <Button type="button" icon={Plus} onClick={openCreate}>
              Nueva compra
            </Button>
          )
        }
        meta={<Badge tone="blue" className="px-3">{totalItems} ordenes</Badge>}
      />

      <PurchaseMetrics summary={summary} allOrdersCount={allOrders.length} money={money} />

      <Card>
        <CardHeader
          icon={Filter}
          title="Filtros de abastecimiento"
          description="Busca por orden, proveedor o notas, y separa por estado operativo."
        />
        <div className="mt-5 grid gap-3 md:grid-cols-[1fr_180px_220px]">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--app-text-muted)]" />
            <input
              className="ui-input w-full pl-9"
              placeholder="Buscar orden, proveedor o notas..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
          <select
            className="ui-input ui-select"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="ALL">Todos los estados</option>
            {Object.entries(PURCHASE_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <select
            className="ui-input ui-select"
            value={supplierFilter}
            onChange={(event) => setSupplierFilter(event.target.value)}
          >
            <option value="ALL">Todos los proveedores</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name || supplier.companyName}
              </option>
            ))}
          </select>
        </div>
      </Card>

      <PurchaseOrderTable
        orders={orders}
        loading={loading}
        metaLoading={metaLoading}
        money={money}
        canManagePurchases={canManagePurchases}
        canReceivePurchases={canReceivePurchases}
        onSelectOrder={setSelectedOrder}
        onRunAction={runAction}
        onReceiveOrder={openWarehouseReceive}
      />

      <BackendPagination
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        indexOfFirstItem={indexOfFirstItem}
        indexOfLastItem={indexOfLastItem}
        totalItems={totalItems}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        label="ordenes"
      />

      {selectedOrder && (
        <PurchaseDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          money={money}
        />
      )}

      {showModal && (
        <PurchaseFormModal
          onClose={() => setShowModal(false)}
          suppliers={suppliers}
          supplierId={supplierId}
          notes={notes}
          setNotes={setNotes}
          items={items}
          setItems={setItems}
          saving={saving}
          supplierProducts={supplierProducts}
          onSupplierChange={handleSupplierChange}
          onSubmit={saveOrder}
          money={money}
        />
      )}
    </div>
  );
};

export default Purchases;
