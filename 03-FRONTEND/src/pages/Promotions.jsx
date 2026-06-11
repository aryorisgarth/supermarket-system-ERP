import React, { useState, useEffect, useCallback } from 'react';
import { Tag, Loader2, BadgePercent, Banknote, ShoppingBag } from 'lucide-react';
import Swal from 'sweetalert2';
import PromotionService from '../services/PromotionService';
import CategoryService from '../services/CategoryService';
import SupplierService from '../services/SupplierService';
import BackendPagination from '../components/ui/BackendPagination';
import useBackendList from '../hooks/useBackendList';
import { formatMoney } from '../utils/formatMoney';

import PromotionsHeader from '../components/promotions/PromotionsHeader';
import PromotionsKpis from '../components/promotions/PromotionsKpis';
import PromotionsFilters from '../components/promotions/PromotionsFilters';
import PromotionsTable from '../components/promotions/PromotionsTable';
import PromotionsCardView from '../components/promotions/PromotionsCardView';
import PromotionFormModal from '../components/promotions/PromotionFormModal';

const TYPE_META = {
  PERCENTAGE: { label: '% Descuento', icon: BadgePercent, color: 'text-blue-600 bg-blue-500/10 border-blue-500/25' },
  FIXED: { label: 'Monto fijo', icon: Banknote, color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/25' },
  BOGO: { label: '2x1', icon: ShoppingBag, color: 'text-purple-600 bg-purple-500/10 border-purple-500/25' },
};

const formatDate = (d) => d ? new Date(d).toLocaleDateString('es-NI', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const Promotions = () => {
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [filterActive, setFilterActive] = useState('all');
  const [viewMode, setViewMode] = useState('CARD');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const buildParams = useCallback(() => ({
    ...(filterActive === 'active' ? { activeOnly: true } : {}),
    ...(filterActive === 'inactive' ? { inactiveOnly: true } : {}),
  }), [filterActive]);

  const loadPage = useCallback((params) => PromotionService.getPage(params), []);
  const {
    items: promos,
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
    filterDeps: [filterActive],
    sort: 'startDate,desc',
  });

  useEffect(() => {
    loadFormData();
  }, []);

  const loadFormData = async () => {
    try {
      const [ca, su] = await Promise.all([
        CategoryService.getAll(),
        SupplierService.getAll(),
      ]);
      setCategories(Array.isArray(ca) ? ca : (ca.content || []));
      setSuppliers(Array.isArray(su) ? su : (su.content || []));
    } catch (err) {
      console.error(err);
    }
  };

  const toast = (icon, title) => {
    Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 2200, timerProgressBar: true })
      .fire({ icon, title });
  };

  const openCreate = () => {
    setEditing(null);
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setShowModal(true);
  };

  const handleToggle = async (p) => {
    try {
      await PromotionService.toggle(p.id);
      toast('success', p.isActive ? 'Promoción desactivada' : 'Promoción activada');
      await reload();
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cambiar el estado.', confirmButtonColor: '#ef4444' });
    }
  };

  const handleDelete = async (p) => {
    const r = await Swal.fire({
      title: '¿Eliminar promoción?',
      text: `"${p.name}" será eliminada permanentemente.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#10b981',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
    if (!r.isConfirmed) return;
    try {
      await PromotionService.delete(p.id);
      toast('success', 'Promoción eliminada');
      await reload();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err?.response?.data?.message || 'No se pudo eliminar.', confirmButtonColor: '#ef4444' });
    }
  };

  const activeCount = promos.filter(p => p.isActive).length;
  const expiryCount = promos.filter(p => p.expiryDaysTrigger != null).length;
  const bogoCount = promos.filter(p => p.type === 'BOGO').length;

  return (
    <div className="space-y-6 animate-fade-in text-[var(--app-text)]">
      <PromotionsHeader onCreate={openCreate} />

      <PromotionsKpis 
        totalItems={totalItems} 
        activeCount={activeCount} 
        expiryCount={expiryCount} 
        bogoCount={bogoCount} 
      />

      <PromotionsFilters 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm} 
        filterActive={filterActive} 
        setFilterActive={setFilterActive} 
        viewMode={viewMode} 
        setViewMode={setViewMode} 
      />

      {loading ? (
        <div className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-3xl p-16 flex flex-col items-center justify-center gap-3 text-[var(--app-text-muted)]">
          <Loader2 className="animate-spin text-[var(--app-primary)]" size={28} />
          <p className="font-bold text-xs">Cargando promociones...</p>
        </div>
      ) : promos.length === 0 ? (
        <div className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-3xl p-16 flex flex-col items-center justify-center gap-3 text-[var(--app-text-muted)] text-center">
          <Tag size={40} className="opacity-40 text-[var(--app-text-muted)]" />
          <div>
            <p className="font-black text-sm text-[var(--app-text)]">No se encontraron promociones</p>
            <p className="text-xs text-[var(--app-text-muted)] mt-1">Crea una nueva promoción para comenzar a aplicar descuentos automáticos.</p>
          </div>
        </div>
      ) : viewMode === 'TABLE' ? (
        <PromotionsTable 
          promos={promos} 
          onEdit={openEdit} 
          onToggle={handleToggle} 
          onDelete={handleDelete} 
          formatMoney={formatMoney} 
          formatDate={formatDate} 
          typeMeta={TYPE_META} 
        />
      ) : (
        <PromotionsCardView 
          promos={promos} 
          onEdit={openEdit} 
          onToggle={handleToggle} 
          onDelete={handleDelete} 
          formatMoney={formatMoney} 
          formatDate={formatDate} 
          typeMeta={TYPE_META} 
        />
      )}

      <BackendPagination
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        indexOfFirstItem={indexOfFirstItem}
        indexOfLastItem={indexOfLastItem}
        totalItems={totalItems}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        label="promociones"
      />

      <PromotionFormModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        editing={editing} 
        categories={categories} 
        suppliers={suppliers} 
        onSuccess={reload} 
      />
    </div>
  );
};

export default Promotions;
