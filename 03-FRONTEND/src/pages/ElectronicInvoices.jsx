import React, { useState, useCallback } from 'react';import {
  FileText,
  Search,
  Eye,
  Loader2,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import Swal from 'sweetalert2';
import ElectronicInvoiceService from '../services/ElectronicInvoiceService';
import ElectronicInvoiceModal from '../components/billing/ElectronicInvoiceModal';
import BackendPagination from '../components/ui/BackendPagination';
import useBackendList from '../hooks/useBackendList';
import { formatMoney } from '../utils/formatMoney';
const fmt = (d) => d ? new Date(d).toLocaleString('es-NI', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const ElectronicInvoices = () => {
  const loadPage = useCallback((params) => ElectronicInvoiceService.getPage(params), []);
  const {
    items: invoices,
    loading,
    searchTerm,
    setSearchTerm,
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    indexOfFirstItem,
    indexOfLastItem,
    handlePageChange,
    handleItemsPerPageChange,
  } = useBackendList({ loadPage, sort: 'createdAt,desc' });

  const [selected, setSelected] = useState(null);
  const handleView = async (inv) => {
    try {
      const full = await ElectronicInvoiceService.bySaleWithDetails(inv.saleId);
      setSelected(full);
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cargar la factura.', confirmButtonColor: '#ef4444' });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark tracking-tight flex items-center gap-2">
            <FileText className="text-primary shrink-0" size={26} /> Facturas Electrónicas
          </h1>
          <p className="text-text-secondary dark:text-text-secondary-dark text-sm font-medium">
            Registro de documentos tributarios emitidos — DGI Nicaragua (simulado)
          </p>
        </div>
        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/25 text-amber-700 px-4 py-2 rounded-xl text-xs font-bold">
          <AlertTriangle size={13} /> Ambiente TEST — Sin validez fiscal real
        </div>
      </div>

      
      <div className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl p-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--app-text-muted)]" />
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar por N° factura, autorización o CUF..." className="w-full pl-9 pr-3 py-2.5 bg-[var(--app-bg-subtle)]/50 border border-[var(--app-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium text-[var(--app-text)]" />
        </div>
      </div>

      
      <div className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-[var(--app-text-muted)]"><Loader2 className="animate-spin mr-2" size={20} /> Cargando...</div>
        ) : invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-[var(--app-text-muted)]">
            <FileText size={38} className="mb-2 opacity-30" />
            <p className="font-semibold text-sm">No hay facturas electrónicas emitidas.</p>
            <p className="text-xs mt-1">Ingrese a una venta y use el botón "Emitir FE".</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--app-bg-subtle)] text-[var(--app-text-muted)] text-[11px] uppercase tracking-wider">
                  <th className="text-left font-bold px-4 py-3">N° Factura</th>
                  <th className="text-left font-bold px-4 py-3">N° Autorización</th>
                  <th className="text-left font-bold px-4 py-3 hidden md:table-cell">CUF</th>
                  <th className="text-right font-bold px-4 py-3">Total</th>
                  <th className="text-center font-bold px-4 py-3">Emitida</th>
                  <th className="text-center font-bold px-4 py-3">Estado</th>
                  <th className="text-center font-bold px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv.id} className="border-t border-[var(--app-border)] hover:bg-[var(--app-bg-subtle)]/40 transition-colors">
                    <td className="px-4 py-3 font-bold text-[var(--app-text)]">{inv.invoiceNumber}</td>
                    <td className="px-4 py-3 text-xs font-mono text-[var(--app-text-soft)]">{inv.authorizationNumber}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="font-mono text-[11px] text-primary">{inv.fiscalUuid}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-[var(--app-text)]">—</td>
                    <td className="px-4 py-3 text-center text-[11px] text-[var(--app-text-soft)]">{fmt(inv.authorizedAt || inv.createdAt)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${inv.status === 'AUTHORIZED' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/25' : inv.status === 'REJECTED' ? 'bg-red-500/10 text-red-600 border-red-500/25' : 'bg-amber-500/10 text-amber-700 border-amber-500/25'}`}>
                        <ShieldCheck size={9} /> {inv.status || 'PENDING'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => handleView(inv)} className="p-2 rounded-lg text-[var(--app-text-muted)] hover:bg-primary/10 hover:text-primary transition-all cursor-pointer" title="Ver factura">
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
        label="facturas"
      />

      {selected && <ElectronicInvoiceModal invoice={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

export default ElectronicInvoices;
