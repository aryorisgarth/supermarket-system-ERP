import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { CalendarClock, AlertTriangle, ShieldAlert } from 'lucide-react';
import Swal from 'sweetalert2';
import ProductBatchService from '../services/ProductBatchService';
import ProductService from '../services/ProductService';
import AuthService from '../services/AuthService';
import { getApiErrorMessage } from '../utils/apiError';
import BackendPagination from '../components/ui/BackendPagination';
import useBackendList from '../hooks/useBackendList';

import BatchHeader from '../components/inventory/BatchHeader';
import BatchKpis from '../components/inventory/BatchKpis';
import BatchFilters from '../components/inventory/BatchFilters';
import BatchTable from '../components/inventory/BatchTable';
import BatchFormModal from '../components/inventory/BatchFormModal';

const today = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const daysUntil = (isoDate) => {
  if (!isoDate) return null;
  const target = new Date(isoDate);
  target.setHours(0, 0, 0, 0);
  return Math.round((target - today()) / (1000 * 60 * 60 * 24));
};

const formatDate = (isoDate) => {
  if (!isoDate) return '—';
  return new Date(isoDate).toLocaleDateString('es-NI', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatQty = (value) => {
  const n = Number(value ?? 0);
  return Number.isInteger(n) ? n.toString() : n.toFixed(2);
};

const getBatchState = (batch) => {
  const days = daysUntil(batch.expirationDate);
  const hasStock = Number(batch.currentQuantity ?? 0) > 0;
  if (!hasStock) {
    return { key: 'empty', label: 'Sin existencia', days, tone: 'slate' };
  }
  if (days < 0) return { key: 'expired', label: 'Vencido', days, tone: 'red' };
  if (days <= 7) return { key: 'critical', label: 'Crítico (≤7 días)', days, tone: 'orange' };
  if (days <= 15) return { key: 'warning', label: 'Alerta (≤15 días)', days, tone: 'amber' };
  if (days <= 30) return { key: 'notice', label: 'Próximo (≤30 días)', days, tone: 'yellow' };
  return { key: 'ok', label: 'Vigente', days, tone: 'emerald' };
};

const toneClasses = {
  red: 'bg-red-500/10 text-red-600 border-red-500/30',
  orange: 'bg-orange-500/10 text-orange-600 border-orange-500/30',
  amber: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  yellow: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/30',
  emerald: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
  slate: 'bg-slate-500/10 text-slate-500 border-slate-500/25',
};

const rowAccent = {
  expired: 'border-l-4 border-l-red-500',
  critical: 'border-l-4 border-l-orange-500',
  warning: 'border-l-4 border-l-amber-400',
  notice: 'border-l-4 border-l-yellow-400',
  ok: 'border-l-4 border-l-transparent',
  empty: 'border-l-4 border-l-transparent opacity-60',
};

const FILTERS = [
  { key: 'all', label: 'Todos' },
  { key: 'expired', label: 'Vencidos' },
  { key: 'critical', label: '≤7 días' },
  { key: 'warning', label: '≤15 días' },
  { key: 'notice', label: '≤30 días' },
  { key: 'ok', label: 'Vigentes' },
];

const BatchManagement = () => {
  const [products, setProducts] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [kpis, setKpis] = useState({ expired: 0, critical: 0, warning: 0, notice: 0 });

  const buildParams = useCallback(() => ({
    expiryState: activeFilter === 'all' ? undefined : activeFilter,
  }), [activeFilter]);

  const loadPage = useCallback((params) => ProductBatchService.getPage(params), []);
  const {
    items: batches,
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
    filterDeps: [activeFilter],
    sort: 'expirationDate,asc',
  });

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const canDeleteBatches = AuthService.hasPermission('INVENTORY_ADJUST');
  const canCreateBatch = AuthService.hasAnyPermission(['INVENTORY_ADJUST', 'BATCH_MANAGE']);
  const canWriteOffExpired = AuthService.hasPermission('INVENTORY_ADJUST');

  useEffect(() => {
    loadFormData();
    loadKpis();
  }, []);

  const loadFormData = async () => {
    try {
      const productRes = await ProductService.getAll();
      setProducts(productRes.content || productRes || []);
    } catch (error) {
      console.error('Fetch products error:', error);
    }
  };

  const loadKpis = async () => {
    try {
      const summary = await ProductBatchService.getSummary();
      setKpis({
        expired: summary?.expiredCount ?? 0,
        critical: summary?.within7Count ?? 0,
        warning: summary?.within15Count ?? 0,
        notice: summary?.within30Count ?? 0,
      });
    } catch {
      setKpis({ expired: 0, critical: 0, warning: 0, notice: 0 });
    }
  };

  const fetchData = async () => {
    await Promise.all([reload(), loadKpis()]);
  };

  const filtered = useMemo(
    () => batches.map((batch) => ({ batch, state: getBatchState(batch) })),
    [batches]
  );

  const handleOpenCreate = () => {
    setEditing(null);
    setShowModal(true);
  };

  const handleOpenEdit = (batch) => {
    setEditing(batch);
    setShowModal(true);
  };

  const handleDelete = async (batch) => {
    const result = await Swal.fire({
      title: '¿Eliminar lote?',
      text: `Se eliminará el lote "${batch.batchCode}". Si tiene existencia, se ajustará el inventario.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#10b981',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });
    if (!result.isConfirmed) return;
    try {
      await ProductBatchService.delete(batch.id);
      Swal.fire({
        icon: 'success',
        title: 'Lote eliminado',
        timer: 1500,
        showConfirmButton: false,
      });
      await fetchData();
    } catch (error) {
      console.error('Delete batch error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: getApiErrorMessage(error, 'No se pudo eliminar el lote.'),
        confirmButtonColor: '#ef4444',
      });
    }
  };

  const handleWriteOffExpired = async () => {
    const result = await Swal.fire({
      title: '¿Dar de baja lotes vencidos?',
      text: 'Se registrarán movimientos EXPIRED y se reducirá el stock de lotes caducados con existencia.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirmar baja',
      cancelButtonText: 'Cancelar',
    });
    if (!result.isConfirmed) return;

    try {
      const data = await ProductBatchService.writeOffExpired();
      await fetchData();
      Swal.fire({
        icon: 'success',
        title: 'Baja completada',
        text: `${data.batchesProcessed} lote(s), ${data.totalQuantityWrittenOff} unidad(es).`,
        timer: 2200,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire('Error', getApiErrorMessage(error, 'No se pudo procesar la baja de vencidos.'), 'error');
    }
  };

  const kpiCards = [
    { key: 'expired', label: 'Vencidos', value: kpis.expired, icon: ShieldAlert, tone: 'red', hint: 'Bloqueados en caja' },
    { key: 'critical', label: 'Vencen en ≤7 días', value: kpis.critical, icon: AlertTriangle, tone: 'orange', hint: 'Acción inmediata' },
    { key: 'warning', label: 'Vencen en ≤15 días', value: kpis.warning, icon: CalendarClock, tone: 'amber', hint: 'Ofertas / combos' },
    { key: 'notice', label: 'Vencen en ≤30 días', value: kpis.notice, icon: CalendarClock, tone: 'yellow', hint: 'Planificar rotación' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <BatchHeader 
        canWriteOffExpired={canWriteOffExpired} 
        canCreateBatch={canCreateBatch} 
        expiredCount={kpis.expired} 
        onRefresh={fetchData} 
        onWriteOff={handleWriteOffExpired} 
        onCreateClick={handleOpenCreate} 
      />

      <BatchKpis 
        kpiCards={kpiCards} 
        activeFilter={activeFilter} 
        onFilterSelect={(key) => setActiveFilter(activeFilter === key ? 'all' : key)} 
        toneClasses={toneClasses} 
      />

      <BatchFilters 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm} 
        activeFilter={activeFilter} 
        setActiveFilter={setActiveFilter} 
        filters={FILTERS} 
      />

      <BatchTable 
        loading={loading} 
        filtered={filtered} 
        canDeleteBatches={canDeleteBatches} 
        onEdit={handleOpenEdit} 
        onDelete={handleDelete} 
        formatDate={formatDate} 
        formatQty={formatQty} 
        toneClasses={toneClasses} 
        rowAccent={rowAccent} 
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
        label="lotes"
      />

      <BatchFormModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        editing={editing} 
        products={products} 
        onSuccess={fetchData} 
      />
    </div>
  );
};

export default BatchManagement;
