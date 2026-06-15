import React, { useState } from 'react';
import { User, X, Search } from 'lucide-react';
import CustomerService from '../../services/CustomerService';
import Swal from 'sweetalert2';

const CheckoutCustomerSelector = ({
  selectedCustomer,
  showCustomerSearch,
  setShowCustomerSearch,
  customerDropdownRef,
  customerQuery,
  handleCustomerInputChange,
  customerResults,
  handleSelectCustomer,
  handleClearCustomer,
  showCustomerDropdown,
  setShowCustomerDropdown,
}) => {
  const [showQuickRegister, setShowQuickRegister] = useState(false);
  const [quickName, setQuickName] = useState('');
  const [quickDocumentId, setQuickDocumentId] = useState('');
  const [quickPhone, setQuickPhone] = useState('');
  const [registering, setRegistering] = useState(false);

  const handleQuickRegister = async () => {
    if (!quickName.trim()) {
      Swal.fire({ icon: 'warning', title: 'Campo requerido', text: 'El Nombre Completo es requerido.' });
      return;
    }
    setRegistering(true);
    try {
      const created = await CustomerService.create({
        fullName: quickName.trim(),
        documentId: quickDocumentId.trim() || null,
        phone: quickPhone.trim() || null,
      });
      handleSelectCustomer(created);
      setShowQuickRegister(false);
      setShowCustomerSearch(false);
      setQuickName('');
      setQuickDocumentId('');
      setQuickPhone('');
      Swal.fire({ icon: 'success', title: 'Cliente registrado', text: `${created.fullName} fue asociado con éxito.`, timer: 1500, showConfirmButton: false });
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Error al registrar cliente';
      Swal.fire({ icon: 'error', title: 'Error', text: msg });
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="pos-checkout-customer-compact relative">
      {selectedCustomer ? (
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2">
          <User size={14} className="shrink-0 text-slate-700" />
          <div className="min-w-0 flex-1 flex flex-col text-left">
            <span className="truncate text-xs font-bold text-[var(--app-text)]">{selectedCustomer.fullName}</span>
            <span className="text-[10px] font-semibold text-amber-600">Puntos: {selectedCustomer.points || 0} pts</span>
          </div>
          <button
            type="button"
            onClick={handleClearCustomer}
            className="shrink-0 text-[var(--app-text-muted)] hover:text-[var(--app-danger)] transition-colors cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div>
          <button
            type="button"
            onClick={() => setShowCustomerSearch(!showCustomerSearch)}
            className="flex w-full items-center justify-between rounded-xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)] px-3 py-2 text-xs font-bold text-[var(--app-text-soft)] hover:bg-[var(--app-border)]/20 transition-all cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <User size={14} />
              {showCustomerSearch ? 'Ocultar buscador de cliente' : 'Asociar Cliente (Consumidor Final)'}
            </span>
            <span className="text-[10px] font-bold text-[var(--app-text-muted)]">
              {showCustomerSearch ? '▲' : '▼'}
            </span>
          </button>
          
          {showCustomerSearch && (
            <div className="relative mt-2" ref={customerDropdownRef}>
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--app-text-muted)]" />
              <input
                type="text"
                placeholder="Buscar por nombre, teléfono o DPI…"
                value={customerQuery}
                onChange={handleCustomerInputChange}
                onFocus={() => customerQuery.length >= 2 && setShowCustomerDropdown(true)}
                className="ui-input w-full pl-9 pr-3 text-xs rounded-xl focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                autoComplete="off"
              />
              {showCustomerDropdown && customerQuery.length >= 2 && (
                <ul className="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-y-auto rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-lg">
                  {customerResults.length === 0 ? (
                    <li className="px-3 py-3 text-center">
                      <p className="text-xs text-[var(--app-text-muted)] mb-2">No se encontraron resultados</p>
                      <button
                        type="button"
                        onClick={() => {
                          setQuickName(customerQuery);
                          setShowQuickRegister(true);
                          setShowCustomerDropdown(false);
                        }}
                        className="w-full rounded-lg bg-[var(--app-primary)] py-1.5 text-xs font-bold text-white hover:bg-[var(--app-primary)]/80 transition-all cursor-pointer"
                      >
                        + Registrar Cliente Rápido
                      </button>
                    </li>
                  ) : (
                    customerResults.map((c) => (
                      <li key={c.id}>
                        <button
                          type="button"
                          onClick={() => {
                            handleSelectCustomer(c);
                            setShowCustomerSearch(false);
                          }}
                          className="flex w-full items-center justify-between px-3 py-2.5 text-left text-xs hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <span className="truncate font-semibold text-[var(--app-text)]">{c.fullName}</span>
                          {c.phone && <span className="text-[10px] text-[var(--app-text-muted)]">{c.phone}</span>}
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {}
      {showQuickRegister && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-xs rounded-2xl bg-[var(--app-surface)] border border-[var(--app-border)] p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black text-[var(--app-text)]">Registro Rápido de Cliente</span>
              <button type="button" onClick={() => setShowQuickRegister(false)} className="text-[var(--app-text-muted)]">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold uppercase text-[var(--app-text-muted)] mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  placeholder="Nombre del cliente"
                  value={quickName}
                  onChange={(e) => setQuickName(e.target.value)}
                  className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2 text-xs text-[var(--app-text)] outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold uppercase text-[var(--app-text-muted)] mb-1">Cédula</label>
                <input
                  type="text"
                  placeholder="Ej: 001-120594-1002Y"
                  value={quickDocumentId}
                  onChange={(e) => setQuickDocumentId(e.target.value)}
                  className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2 text-xs text-[var(--app-text)] outline-none"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold uppercase text-[var(--app-text-muted)] mb-1">Teléfono</label>
                <input
                  type="tel"
                  placeholder="Ej: 5555-1234"
                  value={quickPhone}
                  onChange={(e) => setQuickPhone(e.target.value)}
                  className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2 text-xs text-[var(--app-text)] outline-none"
                />
              </div>
              <button
                type="button"
                disabled={registering}
                onClick={handleQuickRegister}
                className="w-full rounded-lg bg-[var(--app-primary)] py-2 text-xs font-bold text-white transition-all cursor-pointer hover:bg-[var(--app-primary)]/80"
              >
                {registering ? 'Registrando...' : 'Registrar y Asociar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutCustomerSelector;
