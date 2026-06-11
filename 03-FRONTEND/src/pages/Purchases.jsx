import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Ban,
  ClipboardList,
  Filter,
  Loader2,
  PackagePlus,
  Plus,
  Save,
  Search,
  Send,
  Trash2,
  Truck,
  X,
} from 'lucide-react';
import Swal from 'sweetalert2';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Card, { CardHeader } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import PurchaseOrderService from '../services/PurchaseOrderService';
import ProductService from '../services/ProductService';
import SupplierService from '../services/SupplierService';
import BackendPagination from '../components/ui/BackendPagination';
import useBackendList from '../hooks/useBackendList';
import AuthService from '../services/AuthService';
import { normalizeProductList } from '../utils/normalizeProduct';
import { formatMoney } from '../utils/formatMoney';
import { getApiErrorMessage } from '../utils/apiError';
import {
  PURCHASE_STATUS_LABELS,
  PURCHASE_STATUS_TONES,
  RECEIVABLE_STATUSES,
} from '../utils/purchaseReceipt';

import {
  computeLineTotal,
  formatPackSummary,
  getDefaultPurchasePack,
  suggestCostPerPack,
} from '../utils/purchaseUnits';

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

  const total = useMemo(
    () => items.reduce((sum, item) => sum + computeLineTotal(item.quantityInPacks, item.costPerPack), 0),
    [items]
  );

  const findProduct = useCallback(
    (productId) => supplierProducts.find((product) => String(product.id) === String(productId)),
    [supplierProducts]
  );

  const findPack = useCallback((product, packId) => {
    const packs = product?.purchasePacks || [];
    return packs.find((pack) => String(pack.id) === String(packId)) || getDefaultPurchasePack(product);
  }, []);
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

  const selectProductForLine = (index, product) => {
    const defaultPack = getDefaultPurchasePack(product);
    setItems((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) return item;
        return {
          ...item,
          productId: String(product.id),
          productSearch: product.name,
          purchasePackId: defaultPack.id ? String(defaultPack.id) : '',
          quantityInPacks: '1',
          costPerPack: String(suggestCostPerPack(product, defaultPack) || ''),
        };
      })
    );
  };

  const updateLine = (index, key, value) => {
    setItems((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) return item;
        const next = { ...item, [key]: value };
        if (key === 'purchasePackId') {
          const product = findProduct(next.productId);
          const pack = findPack(product, value);
          next.costPerPack = String(suggestCostPerPack(product, pack) || next.costPerPack || '');
        }
        return next;
      })
    );
  };

  const addLine = () => setItems((current) => [...current, emptyLine()]);
  const removeLine = (index) => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));

  const saveOrder = async (event) => {
    event.preventDefault();
    const validItems = items.filter(
      (item) =>
        item.productId
        && item.purchasePackId
        && Number(item.quantityInPacks) > 0
        && Number(item.costPerPack) > 0
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
      cancelButtonText: 'Cancelar'
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
        actions={canManagePurchases && <Button type="button" icon={Plus} onClick={openCreate}>Nueva compra</Button>}
        meta={<Badge tone="blue" className="px-3">{totalItems} ordenes</Badge>}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[var(--app-text-muted)]">Ordenes activas</p>
          <p className="mt-2 text-2xl font-black text-[var(--app-text)]">{summary.activeCount}</p>
          <p className="mt-1 text-[10px] font-bold uppercase text-[var(--app-text-muted)]">{allOrders.length} historicas</p>
        </Card>
        <Card>
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[var(--app-text-muted)]">Pendiente de recibir</p>
          <p className="mt-2 text-2xl font-black text-[var(--app-primary)]">{summary.pendingCount}</p>
          <p className="mt-1 text-[10px] font-bold uppercase text-[var(--app-text-muted)]">{money(summary.pendingAmount)} comprometidos</p>
        </Card>
        <Card>
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[var(--app-text-muted)]">Recepciones parciales</p>
          <p className="mt-2 text-2xl font-black text-amber-500">{summary.partialCount}</p>
          <p className="mt-1 text-[10px] font-bold uppercase text-[var(--app-text-muted)]">Requieren seguimiento</p>
        </Card>
        <Card>
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[var(--app-text-muted)]">Mercaderia recibida</p>
          <p className="mt-2 text-2xl font-black text-emerald-500">{money(summary.receivedAmount)}</p>
          <p className="mt-1 text-[10px] font-bold uppercase text-[var(--app-text-muted)]">{summary.receivedCount} ordenes completas</p>
        </Card>
      </div>

      <Card>
        <CardHeader icon={Filter} title="Filtros de abastecimiento" description="Busca por orden, proveedor o notas, y separa por estado operativo." />
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
          <select className="ui-input ui-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="ALL">Todos los estados</option>
            {Object.entries(PURCHASE_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <select className="ui-input ui-select" value={supplierFilter} onChange={(event) => setSupplierFilter(event.target.value)}>
            <option value="ALL">Todos los proveedores</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>{supplier.name || supplier.companyName}</option>
            ))}
          </select>
        </div>
      </Card>

      <div className="bg-[var(--app-surface)] rounded-xl border border-[var(--app-border)] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[var(--app-text-muted)] text-[10px] font-extrabold uppercase tracking-widest border-b border-[var(--app-border)] bg-[var(--app-bg-subtle)]/50">
                <th className="p-3.5 pl-6">Orden</th>
                <th className="p-3.5">Proveedor</th>
                <th className="p-3.5">Estado</th>
                <th className="p-3.5">Total</th>
                <th className="p-3.5">Fecha</th>
                <th className="p-3.5 pr-6 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--app-border)]">
              {loading || metaLoading ? (
                <tr><td colSpan="6" className="py-20 text-center"><Loader2 className="mx-auto animate-spin text-[var(--app-primary)]" size={34} /></td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan="6" className="py-20 text-center text-xs font-bold text-[var(--app-text-muted)]">No hay ordenes de compra registradas.</td></tr>
              ) : orders.map((order) => (
                <tr key={order.id} className="text-xs hover:bg-[var(--app-bg-subtle)]/30 transition-colors">
                  <td className="p-3.5 pl-6">
                    <button type="button" onClick={() => setSelectedOrder(order)} className="font-black text-[var(--app-primary)] hover:underline">
                      {order.orderNumber}
                    </button>
                  </td>
                  <td className="p-3.5 font-bold text-[var(--app-text-soft)]">{order.supplierName}</td>
                  <td className="p-3.5">
                    <Badge tone={PURCHASE_STATUS_TONES[order.status] || 'neutral'}>{PURCHASE_STATUS_LABELS[order.status] || order.status}</Badge>
                  </td>
                  <td className="p-3.5 font-black text-[var(--app-text)]">{money(order.subtotal)}</td>
                  <td className="p-3.5 font-bold text-[var(--app-text-muted)]">{order.createdAt ? new Date(order.createdAt).toLocaleString() : '-'}</td>
                  <td className="p-3.5 pr-6">
                    <div className="flex justify-center gap-1.5">
                      {canManagePurchases && order.status === 'DRAFT' && (
                        <Button type="button" size="sm" variant="secondary" icon={Send} onClick={() => runAction(order, 'order', 'Marcar como ordenada')}>Ordenar</Button>
                      )}
                      {canReceivePurchases && RECEIVABLE_STATUSES.includes(order.status) && (
                        <Button type="button" size="sm" variant="success" icon={Truck} onClick={() => openWarehouseReceive(order)}>
                          Recibir
                        </Button>
                      )}
                      {canManagePurchases && !['RECEIVED', 'PARTIALLY_RECEIVED', 'CANCELLED'].includes(order.status) && (
                        <Button type="button" size="sm" variant="danger" icon={Ban} onClick={() => runAction(order, 'cancel', 'Cancelar compra')}>Cancelar</Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-[var(--app-surface)] rounded-2xl shadow-2xl border border-[var(--app-border)] max-w-3xl w-full overflow-hidden">
            <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h3 className="font-black text-sm uppercase tracking-wider">{selectedOrder.orderNumber}</h3>
                <p className="text-xs text-white/70 mt-1 font-bold">{selectedOrder.supplierName}</p>
              </div>
              <button type="button" onClick={() => setSelectedOrder(null)} className="hover:bg-white/10 p-1.5 rounded-lg transition-colors"><X size={18} /></button>
            </div>
            <div className="p-5 max-h-[65vh] overflow-y-auto pos-scroll bg-[var(--app-surface)]">
              <table className="w-full text-left text-xs">
                <thead className="text-[10px] font-black uppercase tracking-widest text-[var(--app-text-muted)] border-b border-[var(--app-border)]">
                  <tr>
                    <th className="pb-3">Producto</th>
                    <th className="pb-3">Compra</th>
                    <th className="pb-3 text-center">Uds. inventario</th>
                    <th className="pb-3 text-center">Recibido</th>
                    <th className="pb-3 text-right">Costo/ud</th>
                    <th className="pb-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--app-border)]">
                  {selectedOrder.items?.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3 font-black text-[var(--app-text)]">{item.product?.name}</td>
                      <td className="py-3 text-[11px] font-bold text-[var(--app-text-soft)]">
                        {item.quantityInPacks != null && item.packLabel
                          ? `${item.quantityInPacks} ${item.packLabel}${item.unitsPerPack ? ` (${item.unitsPerPack} u/empaque)` : ''}`
                          : `${item.quantityOrdered} UN`}
                      </td>
                      <td className="py-3 text-center font-bold text-[var(--app-text-soft)]">{item.quantityOrdered}</td>
                      <td className="py-3 text-center font-bold text-[var(--app-text-soft)]">{item.quantityReceived}</td>
                      <td className="py-3 text-right font-bold text-[var(--app-text-soft)]">{money(item.unitCost)}</td>
                      <td className="py-3 text-right font-black text-[var(--app-text)]">{money(item.lineTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-5 bg-[var(--app-bg-subtle)]/50 border-t border-[var(--app-border)] flex justify-between items-center">
              <p className="text-[10px] font-black text-[var(--app-text-muted)] uppercase tracking-widest">Total de Facturación</p>
              <p className="text-xl font-black text-[var(--app-primary)]">{money(selectedOrder.subtotal)}</p>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-[var(--app-surface)] rounded-3xl shadow-2xl border border-[var(--app-border)] max-w-4xl w-full overflow-hidden">
            <div className="p-6 bg-[var(--app-primary)] text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <PackagePlus size={22} strokeWidth={2.5} />
                <div>
                  <h3 className="font-black text-sm uppercase tracking-wider">Registrar Orden de Compra</h3>
                  <p className="text-[10px] text-white/80 font-bold uppercase tracking-widest mt-0.5">Entrada de stock a bodega SuperNova</p>
                </div>
              </div>
              <button type="button" onClick={() => setShowModal(false)} className="hover:bg-white/10 p-1.5 rounded-lg transition-colors"><X size={20} /></button>
            </div>
            
            <form onSubmit={saveOrder} className="p-6 space-y-6 bg-[var(--app-surface)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--app-text-muted)]">Proveedor</label>
                  <select required value={supplierId} onChange={(e) => handleSupplierChange(e.target.value)} className="w-full px-4 py-2.5 bg-[var(--app-bg-subtle)] border border-[var(--app-border)] rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-black text-[var(--app-text)] cursor-pointer transition-all">
                    <option value="">Seleccionar proveedor...</option>
                    {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name || s.companyName}</option>)}
                  </select>
                  <p className="text-[10px] font-medium text-[var(--app-text-muted)]">
                    {supplierId
                      ? `${supplierProducts.length} producto(s) en el catalogo de este proveedor`
                      : 'Primero elige proveedor; solo veras sus productos.'}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--app-text-muted)]">Notas de Recepción</label>
                  <input value={notes} onChange={(e) => setNotes(e.target.value)} maxLength="255" className="w-full px-4 py-2.5 bg-[var(--app-bg-subtle)] border border-[var(--app-border)] rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-bold text-[var(--app-text)] transition-all" placeholder="Ej. Factura #4452 - Entrega inmediata" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--app-text-muted)]">Desglose de Productos</label>
                  <button type="button" onClick={addLine} className="flex items-center gap-1.5 text-[9px] font-black text-[var(--app-primary)] uppercase hover:opacity-70"><Plus size={12} strokeWidth={3} /> Añadir Linea</button>
                </div>
                
                <div className="max-h-[35vh] overflow-y-auto pos-scroll space-y-3 pr-2">
                  {items.map((item, index) => {
                    const product = findProduct(item.productId);
                    const packs = product?.purchasePacks?.length
                      ? product.purchasePacks
                      : [{ id: '', label: 'UN', factor: 1 }];
                    const selectedPack = findPack(product, item.purchasePackId);
                    const search = (item.productSearch || '').trim().toLowerCase();
                    const filteredProducts = supplierProducts.filter((candidate) => {
                      if (!search) return true;
                      return (
                        candidate.name?.toLowerCase().includes(search)
                        || candidate.barcode?.toLowerCase().includes(search)
                      );
                    }).slice(0, 8);
                    const lineTotal = computeLineTotal(item.quantityInPacks, item.costPerPack);

                    return (
                    <div key={index} className="flex flex-col gap-3 bg-[var(--app-bg-subtle)]/50 p-4 rounded-2xl border border-[var(--app-border)] relative group transition-all hover:border-[var(--app-primary)]/30">
                      <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1 space-y-1.5 relative">
                        <label className="text-[8px] font-black text-[var(--app-text-muted)] uppercase tracking-widest">Producto del proveedor</label>
                        <input
                          type="text"
                          value={item.productSearch}
                          onChange={(e) => updateLine(index, 'productSearch', e.target.value)}
                          placeholder={supplierId ? 'Buscar por nombre...' : 'Selecciona proveedor primero'}
                          disabled={!supplierId}
                          className="w-full bg-[var(--app-surface)] border border-[var(--app-border)] rounded-xl px-3 py-2 text-[11px] font-bold text-[var(--app-text)] outline-none focus:border-[var(--app-primary)] transition-all disabled:opacity-50"
                        />
                        {supplierId && search && filteredProducts.length > 0 && !item.productId && (
                          <div className="absolute z-20 left-0 right-0 top-full mt-1 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-lg overflow-hidden">
                            {filteredProducts.map((candidate) => (
                              <button
                                key={candidate.id}
                                type="button"
                                onClick={() => selectProductForLine(index, candidate)}
                                className="w-full text-left px-3 py-2 text-[11px] font-bold hover:bg-[var(--app-bg-subtle)]"
                              >
                                {candidate.name}
                              </button>
                            ))}
                          </div>
                        )}
                        {item.productId && product && (
                          <p className="text-[10px] font-medium text-[var(--app-text-muted)]">SKU venta: {product.barcode}</p>
                        )}
                      </div>
                      <div className="w-full md:w-32 space-y-1.5">
                        <label className="text-[8px] font-black text-[var(--app-text-muted)] uppercase tracking-widest">Presentacion</label>
                        <select
                          required
                          value={item.purchasePackId}
                          onChange={(e) => updateLine(index, 'purchasePackId', e.target.value)}
                          disabled={!item.productId}
                          className="w-full bg-[var(--app-surface)] border border-[var(--app-border)] rounded-xl px-3 py-2 text-[11px] font-bold text-[var(--app-text)] outline-none focus:border-[var(--app-primary)] transition-all cursor-pointer disabled:opacity-50"
                        >
                          <option value="">Empaque...</option>
                          {packs.map((pack) => (
                            <option key={pack.id || pack.label} value={pack.id || ''}>
                              {pack.label} ({pack.factor} u)
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="w-full md:w-24 space-y-1.5">
                        <label className="text-[8px] font-black text-[var(--app-text-muted)] uppercase tracking-widest">Cant. empaques</label>
                        <input type="number" min="0.01" step="0.01" required value={item.quantityInPacks} onChange={(e) => updateLine(index, 'quantityInPacks', e.target.value)} disabled={!item.productId} className="w-full bg-[var(--app-surface)] border border-[var(--app-border)] rounded-xl px-3 py-2 text-[11px] font-black text-[var(--app-text)] outline-none focus:border-[var(--app-primary)] transition-all disabled:opacity-50" />
                      </div>
                      <div className="w-full md:w-32 space-y-1.5">
                        <label className="text-[8px] font-black text-[var(--app-text-muted)] uppercase tracking-widest">Precio / empaque</label>
                        <input type="number" min="0.01" step="0.01" required value={item.costPerPack} onChange={(e) => updateLine(index, 'costPerPack', e.target.value)} disabled={!item.productId} className="w-full bg-[var(--app-surface)] border border-[var(--app-border)] rounded-xl px-3 py-2 text-[11px] font-black text-[var(--app-text)] outline-none focus:border-[var(--app-primary)] transition-all disabled:opacity-50" />
                      </div>
                      <div className="flex items-end pb-0.5">
                        <button type="button" onClick={() => removeLine(index)} disabled={items.length === 1} className="h-9 w-9 rounded-xl text-[var(--app-text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-all disabled:opacity-30">
                          <Trash2 size={16} strokeWidth={2.5} className="mx-auto" />
                        </button>
                      </div>
                      </div>
                      {item.productId && (
                        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[var(--app-surface)] px-3 py-2 text-[10px] font-bold text-[var(--app-text-muted)]">
                          <span>{formatPackSummary(item.quantityInPacks, selectedPack?.label, selectedPack?.factor)}</span>
                          <span className="text-[var(--app-primary)]">Linea: {money(lineTotal)}</span>
                        </div>
                      )}
                    </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-5 border-t border-[var(--app-border)] flex flex-col md:flex-row justify-between items-center gap-5">
                <div className="text-left">
                  <p className="text-[9px] font-black text-[var(--app-text-muted)] uppercase tracking-widest">Inversión Estimada</p>
                  <p className="text-2xl font-black text-[var(--app-text)]">{money(total)}</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 md:flex-none px-6 py-3 border border-[var(--app-border)] text-[var(--app-text-soft)] font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-[var(--app-bg-subtle)] transition-all">Cancelar</button>
                  <button type="submit" disabled={saving} className="flex-1 md:flex-none px-8 py-3 bg-[var(--app-primary)] text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer">
                    {saving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} strokeWidth={2.5} />} Guardar Orden
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Purchases;
