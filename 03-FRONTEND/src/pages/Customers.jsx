import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Edit2, Gift, Plus, Search, Star, Trash2, User, X,
  TrendingUp, ChevronLeft, ChevronRight, RefreshCw, History, Loader2,
} from 'lucide-react';
import Swal from 'sweetalert2';
import CustomerService from '../services/CustomerService';
import AuthService from '../services/AuthService';
import PageHeader from '../components/ui/PageHeader';
import CustomerModal from '../components/customers/CustomerModal';
import PointsModal from '../components/customers/PointsModal';
import SalesHistoryModal from '../components/customers/SalesHistoryModal';

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const POINTS_PER_QUETZAL = 10;

const pointsBadgeClass = (points) => {
  if (points >= 500) return 'bg-[var(--app-warning-soft)] text-[var(--app-warning)]';
  if (points >= 100) return 'bg-[var(--app-bg-subtle)] text-[var(--app-text-muted)]';
  return 'bg-[var(--app-primary-soft)] text-[var(--app-primary)]';
};

const Customers = () => {
  const user = AuthService.getCurrentUser();
  const roleName = user?.role?.name;
  const isAdmin = ['ADMINISTRADOR', 'ADMIN_INGENIERO', 'SUPERVISOR'].includes(roleName);

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [pointsCustomer, setPointsCustomer] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyCustomerId, setHistoryCustomerId] = useState(null);

  const searchTimeout = useRef(null);

  const loadCustomers = useCallback(async (p = 0, searchVal = '') => {
    setLoading(true);
    try {
      const data = await CustomerService.getAll(p, 12, 'fullName', searchVal);
      setCustomers(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
      setPage(p);
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudieron cargar los clientes.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => loadCustomers(0, search.trim()), 350);
    return () => clearTimeout(searchTimeout.current);
  }, [search, loadCustomers]);

  const handleSaved = (saved) => {
    setCustomers((prev) => {
      const idx = prev.findIndex((c) => c.id === saved.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [saved, ...prev];
    });
    loadCustomers(page, search.trim());
  };

  const handleDelete = async (customer) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: '¿Eliminar cliente?',
      html: `Se eliminará a <b>${customer.fullName}</b> del sistema.<br/><small>No se puede eliminar si tiene ventas registradas.</small>`,
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
    });
    if (!result.isConfirmed) return;
    try {
      await CustomerService.delete(customer.id);
      setCustomers((prev) => prev.filter((c) => c.id !== customer.id));
      setTotalElements((p) => p - 1);
    } catch (err) {
      const msg = err?.response?.data?.message || 'No se pudo eliminar el cliente.';
      Swal.fire({ icon: 'error', title: 'Error', text: msg });
    }
  };

  const totalPts = customers.reduce((a, c) => a + (c.points || 0), 0);
  const withPoints = customers.filter((c) => (c.points || 0) > 0).length;
  const goldCount = customers.filter((c) => (c.points || 0) >= 500).length;

  const stats = [
    { icon: User, label: 'Total Clientes', value: totalElements.toLocaleString(), tone: 'primary' },
    { icon: Gift, label: 'Con puntos', value: withPoints, tone: 'warning' },
    { icon: Star, label: 'Nivel Oro (500+)', value: goldCount, tone: 'warning' },
    { icon: TrendingUp, label: 'Pts. en pantalla', value: totalPts.toLocaleString(), tone: 'success' },
  ];

  const toneClass = {
    primary: 'bg-[var(--app-primary-soft)] text-[var(--app-primary)]',
    warning: 'bg-[var(--app-warning-soft)] text-[var(--app-warning)]',
    success: 'bg-[var(--app-success-soft)] text-[var(--app-success)]',
  };

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6 animate-fade-in">
      <PageHeader
        title="Clientes y Fidelización"
        description={`${totalElements.toLocaleString()} clientes registrados · 1 punto por cada Q${POINTS_PER_QUETZAL} de compra`}
        actions={
          <button
            id="btn-new-customer"
            type="button"
            onClick={() => { setEditingCustomer(null); setShowModal(true); }}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--app-primary)] to-blue-700 px-5 py-3 text-sm font-bold text-white shadow-md transition-all hover:scale-[1.02] sm:w-auto"
          >
            <Plus size={18} />
            Nuevo Cliente
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(({ icon: Icon, label, value, tone }) => (
          <div
            key={label}
            className="flex items-center gap-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 shadow-sm"
          >
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${toneClass[tone]}`}>
              <Icon size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">{label}</p>
              <p className="text-xl font-black leading-tight text-[var(--app-text)]">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 shadow-sm">
        <Search size={16} className="shrink-0 text-[var(--app-text-muted)]" />
        <input
          id="customer-search"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, teléfono o DPI…"
          className="flex-1 border-none bg-transparent text-sm font-medium text-[var(--app-text)] outline-none placeholder:text-[var(--app-text-muted)]"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            className="cursor-pointer border-none bg-transparent p-0 text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
          >
            <X size={14} />
          </button>
        )}
        <button
          type="button"
          onClick={() => loadCustomers(0, search.trim())}
          title="Recargar"
          className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-[var(--app-border)] text-[var(--app-text-muted)] transition-colors hover:bg-[var(--app-bg-subtle)] hover:text-[var(--app-text)]"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-[var(--app-text-muted)]">
          <Loader2 size={36} className="mx-auto mb-3 animate-spin text-[var(--app-primary)]" />
          <p className="text-xs font-bold uppercase tracking-wider">Cargando clientes...</p>
        </div>
      ) : customers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--app-border)] bg-[var(--app-surface)] py-16 text-center">
          <User size={36} className="mx-auto mb-3 opacity-30 text-[var(--app-text-muted)]" />
          <p className="text-sm font-bold text-[var(--app-text-muted)]">
            {search ? 'Sin resultados para esa búsqueda' : 'No hay clientes registrados aún'}
          </p>
          {!search && (
            <button
              type="button"
              onClick={() => { setEditingCustomer(null); setShowModal(true); }}
              className="mt-4 cursor-pointer rounded-xl bg-[var(--app-primary)] px-5 py-2.5 text-xs font-bold uppercase text-white"
            >
              Registrar primer cliente
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--app-border)] bg-[var(--app-bg-subtle)] text-[10px] font-extrabold uppercase tracking-widest text-[var(--app-text-muted)]">
                  <th className="px-4 py-3 pl-6">#</th>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Teléfono</th>
                  <th className="px-4 py-3">Documento</th>
                  <th className="px-4 py-3">Puntos</th>
                  <th className="px-4 py-3">Últ. Compra</th>
                  <th className="px-4 py-3 pr-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--app-border)]">
                {customers.map((c, index) => {
                  const rowIndex = page * 12 + index + 1;
                  return (
                    <tr key={c.id} className="transition-colors hover:bg-[var(--app-bg-subtle)]/60">
                      <td className="px-4 py-3 pl-6 font-bold text-[var(--app-text-muted)]">{rowIndex}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--app-primary-soft)]">
                            <User size={13} className="text-[var(--app-primary)]" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-bold text-[var(--app-text)]">{c.fullName}</p>
                            {c.email && (
                              <p className="truncate text-[10px] text-[var(--app-text-muted)]">{c.email}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-[var(--app-text-soft)]">{c.phone || '—'}</td>
                      <td className="px-4 py-3 font-medium text-[var(--app-text-soft)]">{c.documentId || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`rounded-md px-2 py-0.5 text-[11px] font-extrabold ${pointsBadgeClass(c.points || 0)}`}>
                            {(c.points || 0).toLocaleString()} pts
                          </span>
                          <span className="text-[11px] font-semibold text-[var(--app-text-muted)]">
                            ≈ Q{(c.points || 0).toFixed(0)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-[var(--app-text-soft)]">
                        {c.lastPurchaseDate ? fmtDate(c.lastPurchaseDate) : 'Sin compras'}
                      </td>
                      <td className="px-4 py-3 pr-6">
                        <div className="flex justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => { setHistoryCustomerId(c.id); setShowHistoryModal(true); }}
                            title="Historial de compras"
                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-[var(--app-border)] text-[var(--app-text-muted)] transition-colors hover:bg-[var(--app-bg-subtle)] hover:text-[var(--app-primary)]"
                          >
                            <History size={13} />
                          </button>
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => { setPointsCustomer(c); setShowPointsModal(true); }}
                              title="Ajustar puntos"
                              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-[var(--app-border)] text-[var(--app-warning)] transition-colors hover:bg-[var(--app-warning-soft)]"
                            >
                              <Gift size={13} />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => { setEditingCustomer(c); setShowModal(true); }}
                            title="Editar"
                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-[var(--app-border)] text-[var(--app-text-muted)] transition-colors hover:bg-[var(--app-bg-subtle)] hover:text-[var(--app-primary)]"
                          >
                            <Edit2 size={13} />
                          </button>
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => handleDelete(c)}
                              title="Eliminar"
                              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-[var(--app-danger)]/30 text-[var(--app-danger)] transition-colors hover:bg-[var(--app-danger-soft)]"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {totalPages > 1 && !search && (
        <div className="ui-card ui-card-pad flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => loadCustomers(page - 1, '')}
            disabled={page === 0}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-[var(--app-border)] text-[var(--app-text-muted)] transition-colors hover:bg-[var(--app-bg-subtle)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs font-bold text-[var(--app-text-muted)]">
            Pág. {page + 1} de {totalPages} ({totalElements.toLocaleString()} clientes)
          </span>
          <button
            type="button"
            onClick={() => loadCustomers(page + 1, '')}
            disabled={page >= totalPages - 1}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-[var(--app-border)] text-[var(--app-text-muted)] transition-colors hover:bg-[var(--app-bg-subtle)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {showModal && (
        <CustomerModal
          customer={editingCustomer}
          onClose={() => { setShowModal(false); setEditingCustomer(null); }}
          onSaved={handleSaved}
        />
      )}

      {showPointsModal && pointsCustomer && (
        <PointsModal
          customer={pointsCustomer}
          onClose={() => { setShowPointsModal(false); setPointsCustomer(null); }}
          onSaved={handleSaved}
        />
      )}

      {showHistoryModal && historyCustomerId && (
        <SalesHistoryModal
          customerId={historyCustomerId}
          onClose={() => { setShowHistoryModal(false); setHistoryCustomerId(null); }}
        />
      )}
    </div>
  );
};

export default Customers;
