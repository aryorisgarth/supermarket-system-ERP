import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Award, Edit2, Gift, Plus, Search, Star, Trash2, User, X,
  TrendingUp, ChevronLeft, ChevronRight, RefreshCw, History
} from 'lucide-react';
import Swal from 'sweetalert2';
import CustomerService from '../services/CustomerService';
import AuthService from '../services/AuthService';


import CustomerModal from '../components/customers/CustomerModal';
import PointsModal from '../components/customers/PointsModal';
import SalesHistoryModal from '../components/customers/SalesHistoryModal';


const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const POINTS_PER_QUETZAL = 10;   


const Customers = () => {
  const user = AuthService.getCurrentUser();
  const roleName = user?.role?.name;
  const isAdmin = ['ADMINISTRADOR', 'ADMIN_INGENIERO', 'SUPERVISOR'].includes(roleName);

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);
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

  useEffect(() => { loadCustomers(0, search.trim()); }, [loadCustomers]);

  
  useEffect(() => {
    clearTimeout(searchTimeout.current);
    setSearching(true);
    searchTimeout.current = setTimeout(() => {
      loadCustomers(0, search.trim());
      setSearching(false);
    }, 350);
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

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setShowModal(true);
  };

  const handleNew = () => {
    setEditingCustomer(null);
    setShowModal(true);
  };

  const handlePointsAdjustment = (customer) => {
    setPointsCustomer(customer);
    setShowPointsModal(true);
  };

  const handleHistory = (id) => {
    setHistoryCustomerId(id);
    setShowHistoryModal(true);
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

  return (
    <div className="app-page animate-fade-in" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>

      {}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyBetween: 'space-between', gap: '16px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '14px', flexShrink: 0,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Award size={22} style={{ color: '#fff' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--app-text)', margin: 0 }}>
              Clientes y Fidelización
            </h1>
            <p style={{ fontSize: '11px', color: 'var(--app-text-muted)', margin: '2px 0 0', fontWeight: 600 }}>
              {totalElements.toLocaleString()} clientes registrados · 1 punto por cada Q{POINTS_PER_QUETZAL} de compra
            </p>
          </div>
        </div>
        <button
          id="btn-new-customer"
          type="button" onClick={handleNew}
          style={{
            display: 'flex', alignItems: 'center', gap: '7px', padding: '0 18px', height: '42px',
            borderRadius: '12px', border: 'none', background: 'var(--app-primary)',
            color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 800,
            textTransform: 'uppercase', letterSpacing: '0.06em',
          }}
        >
          <Plus size={15} />
          Nuevo Cliente
        </button>
      </div>

      {}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
        {[
          { icon: <User size={16} />, label: 'Total Clientes', value: totalElements.toLocaleString(), color: '#6366f1' },
          { icon: <Gift size={16} />, label: 'Con puntos', value: withPoints, color: '#f59e0b' },
          { icon: <Star size={16} />, label: 'Nivel Oro (500+)', value: goldCount, color: '#f59e0b' },
          { icon: <TrendingUp size={16} />, label: 'Pts. en pantalla', value: totalPts.toLocaleString(), color: '#10b981' },
        ].map((s, i) => (
          <div key={i} style={{
            background: 'var(--app-surface)', border: '1px solid var(--app-border)',
            borderRadius: '12px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px',
          }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
              background: s.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: s.color }}>{s.icon}</span>
            </div>
            <div>
              <p style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--app-text-muted)', margin: 0 }}>{s.label}</p>
              <p style={{ fontSize: '20px', fontWeight: 900, color: 'var(--app-text)', margin: 0, lineHeight: 1.1 }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {}
      <div style={{
        background: 'var(--app-surface)', border: '1px solid var(--app-border)',
        borderRadius: '14px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '10px',
      }}>
        <Search size={15} style={{ color: 'var(--app-text-muted)', flexShrink: 0 }} />
        <input
          id="customer-search"
          type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, teléfono o DPI…"
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            fontSize: '13px', fontWeight: 600, color: 'var(--app-text)',
          }}
        />
        {search && (
          <button
            type="button" onClick={() => setSearch('')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--app-text-muted)', padding: 0 }}
          >
            <X size={14} />
          </button>
        )}
        <button
          type="button" onClick={() => loadCustomers(0, search.trim())} title="Recargar"
          style={{
            width: '34px', height: '34px', borderRadius: '8px', border: '1px solid var(--app-border)',
            background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--app-text-muted)',
          }}
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--app-text-muted)' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%', border: '3px solid var(--app-border)',
            borderTopColor: 'var(--app-primary)', animation: 'spin 0.7s linear infinite', margin: '0 auto 12px',
          }} />
          <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>Cargando clientes...</p>
        </div>
      ) : customers.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 0', background: 'var(--app-surface)',
          border: '1px dashed var(--app-border)', borderRadius: '16px',
        }}>
          <User size={36} style={{ margin: '0 auto 12px', opacity: 0.3, display: 'block' }} />
          <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--app-text-muted)' }}>
            {search ? 'Sin resultados para esa búsqueda' : 'No hay clientes registrados aún'}
          </p>
          {!search && (
            <button
              type="button" onClick={handleNew}
              style={{
                marginTop: '12px', padding: '8px 20px', borderRadius: '10px',
                border: 'none', background: 'var(--app-primary)', color: '#fff',
                cursor: 'pointer', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase',
              }}
            >
              Registrar primer cliente
            </button>
          )}
        </div>
      ) : (
        <div style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)', borderRadius: '16px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'var(--app-surface)', borderBottom: '2px solid var(--app-border)', color: 'var(--app-text-muted)', textTransform: 'uppercase', fontSize: '10px', fontWeight: 800, height: '42px' }}>
                <th style={{ padding: '12px 16px' }}>#</th>
                <th style={{ padding: '12px 16px' }}>Nombre</th>
                <th style={{ padding: '12px 16px' }}>Teléfono</th>
                <th style={{ padding: '12px 16px' }}>Documento</th>
                <th style={{ padding: '12px 16px' }}>Puntos</th>
                <th style={{ padding: '12px 16px' }}>Últ. Compra</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c, index) => {
                const rowIndex = page * 12 + index + 1;
                return (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--app-border)', height: '48px' }} className="table-row-hover">
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--app-text-muted)' }}>{rowIndex}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <User size={13} style={{ color: 'var(--app-primary)' }} />
                        </div>
                        <div>
                          <p style={{ fontWeight: 700, color: 'var(--app-text)', margin: 0 }}>{c.fullName}</p>
                          {c.email && <p style={{ fontSize: '10px', color: 'var(--app-text-muted)', margin: 0 }}>{c.email}</p>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--app-text-soft)' }}>{c.phone || '—'}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--app-text-soft)' }}>{c.documentId || '—'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{
                          padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 800,
                          background: c.points >= 500 ? 'rgba(245,158,11,0.15)' : c.points >= 100 ? 'rgba(148,163,184,0.15)' : 'rgba(205,124,82,0.15)',
                          color: c.points >= 500 ? '#f59e0b' : c.points >= 100 ? '#94a3b8' : '#cd7c52'
                        }}>
                          {c.points.toLocaleString()} pts
                        </span>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--app-text-muted)' }}>≈ Q{c.points.toFixed(0)}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--app-text-soft)' }}>
                      {c.lastPurchaseDate ? fmtDate(c.lastPurchaseDate) : 'Sin compras'}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button
                          type="button" onClick={() => handleHistory(c.id)} title="Historial de compras"
                          style={{ width: '30px', height: '30px', borderRadius: '8px', border: '1px solid var(--app-border)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--app-text-muted)' }}
                        >
                          <History size={13} />
                        </button>
                        {isAdmin && (
                          <button
                            type="button" onClick={() => handlePointsAdjustment(c)} title="Ajustar puntos"
                            style={{ width: '30px', height: '30px', borderRadius: '8px', border: '1px solid var(--app-border)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}
                          >
                            <Gift size={13} />
                          </button>
                        )}
                        <button
                          type="button" onClick={() => handleEdit(c)} title="Editar"
                          style={{ width: '30px', height: '30px', borderRadius: '8px', border: '1px solid var(--app-border)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--app-text-muted)' }}
                        >
                          <Edit2 size={13} />
                        </button>
                        {isAdmin && (
                          <button
                            type="button" onClick={() => handleDelete(c)} title="Eliminar"
                            style={{ width: '30px', height: '30px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}
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
      )}

      {}
      {totalPages > 1 && !search && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <button
            type="button" onClick={() => loadCustomers(page - 1, '')} disabled={page === 0}
            style={{
              width: '36px', height: '36px', borderRadius: '8px', border: '1px solid var(--app-border)',
              background: page === 0 ? 'var(--app-bg)' : 'var(--app-surface)', cursor: page === 0 ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--app-text-muted)',
              opacity: page === 0 ? 0.4 : 1,
            }}
          >
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--app-text-muted)' }}>
            Pág. {page + 1} de {totalPages} ({totalElements.toLocaleString()} clientes)
          </span>
          <button
            type="button" onClick={() => loadCustomers(page + 1, '')} disabled={page >= totalPages - 1}
            style={{
              width: '36px', height: '36px', borderRadius: '8px', border: '1px solid var(--app-border)',
              background: page >= totalPages - 1 ? 'var(--app-bg)' : 'var(--app-surface)',
              cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--app-text-muted)',
              opacity: page >= totalPages - 1 ? 0.4 : 1,
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {}
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

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .table-row-hover:hover {
          background-color: rgba(99,102,241,0.04) !important;
        }
      `}</style>
    </div>
  );
};

export default Customers;
