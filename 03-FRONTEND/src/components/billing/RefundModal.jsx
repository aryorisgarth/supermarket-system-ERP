import React, { useState, useEffect, useMemo } from 'react';
import { X, Loader2, Undo2, RotateCcw, AlertTriangle } from 'lucide-react';
import Swal from 'sweetalert2';
import SaleService from '../../services/SaleService';
import { formatMoney } from '../../utils/formatMoney';

const REASONS = [
  'Producto defectuoso',
  'Producto vencido / mal estado',
  'Error del cajero',
  'Cliente cambió de opinión',
  'Cobro duplicado',
  'Otro',
];

const toNum = (v) => Number(v ?? 0);

const RefundModal = ({ saleId, invoiceNumber, onClose, onDone }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [reason, setReason] = useState(REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const res = await SaleService.getRefundable(saleId);
        if (!active) return;
        setData(res);
        const initial = {};
        (res.lines || []).forEach((l) => { initial[l.saleDetailId] = 0; });
        setQuantities(initial);
      } catch (error) {
        console.error('Refundable error:', error);
        Swal.fire('Error', 'No se pudo cargar la información de devolución.', 'error');
        onClose?.();
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [saleId, onClose]);

  const setQty = (lineId, value, max) => {
    let q = Number(value);
    if (Number.isNaN(q) || q < 0) q = 0;
    if (q > max) q = max;
    setQuantities((prev) => ({ ...prev, [lineId]: q }));
  };

  const fillAll = () => {
    const next = {};
    (data?.lines || []).forEach((l) => { next[l.saleDetailId] = toNum(l.returnableQuantity); });
    setQuantities(next);
  };

  const clearAll = () => {
    const next = {};
    (data?.lines || []).forEach((l) => { next[l.saleDetailId] = 0; });
    setQuantities(next);
  };

  const totalRefund = useMemo(() => {
    if (!data) return 0;
    return data.lines.reduce((acc, l) => acc + toNum(quantities[l.saleDetailId]) * toNum(l.unitRefund), 0);
  }, [data, quantities]);

  const selectedCount = useMemo(
    () => Object.values(quantities).filter((q) => toNum(q) > 0).length,
    [quantities]
  );

  const finalReason = reason === 'Otro' ? customReason.trim() : reason;

  const handleSubmit = async () => {
    const lines = Object.entries(quantities)
      .filter(([, q]) => toNum(q) > 0)
      .map(([saleDetailId, quantity]) => ({ saleDetailId: Number(saleDetailId), quantity: Number(quantity) }));

    if (lines.length === 0) {
      Swal.fire({ icon: 'warning', title: 'Sin selección', text: 'Indique al menos una cantidad a devolver.' });
      return;
    }
    if (!finalReason) {
      Swal.fire({ icon: 'warning', title: 'Motivo requerido', text: 'Especifique el motivo de la devolución.' });
      return;
    }

    const confirm = await Swal.fire({
      title: '¿Confirmar devolución?',
      html: `Se generará una <b>Nota de Crédito</b> por <b>${formatMoney(totalRefund)}</b> y se reintegrará el stock al inventario.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, devolver',
      cancelButtonText: 'Cancelar',
    });
    if (!confirm.isConfirmed) return;

    try {
      setSubmitting(true);
      const note = await SaleService.refund(saleId, finalReason, lines);
      await Swal.fire({
        icon: 'success',
        title: 'Devolución registrada',
        html: `Nota de Crédito <b>${note.creditNoteNumber || ''}</b> por <b>${formatMoney(note.amount)}</b>.`,
        timer: 2600,
        showConfirmButton: false,
      });
      onDone?.();
    } catch (error) {
      console.error('Refund error:', error);
      const msg = error.response?.data?.message || error.message
        || 'No se pudo registrar la devolución. Verifique que tenga una caja abierta.';
      Swal.fire({ icon: 'error', title: 'Error en la devolución', text: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const allReturned = data?.fullyRefunded;

  return (
    <div className="fixed inset-0 bg-[var(--app-bg)]/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-fade-in">
      <div className="bg-[var(--app-surface)] rounded-3xl shadow-2xl border border-[var(--app-border)] max-w-2xl w-full overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-600 to-rose-500 p-5 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/15 rounded-lg">
              <Undo2 size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider">Devolución / Nota de Crédito</h3>
              <p className="text-white/80 text-[11px] font-medium">Factura {invoiceNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-all cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-[var(--app-text-muted)]">
            <Loader2 className="animate-spin mr-2" size={22} /> Cargando líneas...
          </div>
        ) : (
          <>
            <div className="px-5 py-3 bg-[var(--app-bg-subtle)] border-b border-[var(--app-border)] flex items-center justify-between gap-3 shrink-0">
              <div className="text-xs font-semibold text-[var(--app-text-soft)]">
                Ya devuelto: <span className="font-black text-[var(--app-text)]">{formatMoney(data.alreadyRefunded)}</span>
                <span className="mx-2 opacity-40">|</span>
                Disponible: <span className="font-black text-[var(--app-text)]">{formatMoney(data.refundableTotal)}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={fillAll} disabled={allReturned} className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 transition-all disabled:opacity-40 cursor-pointer">
                  Devolver todo
                </button>
                <button onClick={clearAll} className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-[var(--app-surface)] border border-[var(--app-border)] text-[var(--app-text-soft)] hover:bg-[var(--app-bg-subtle)] transition-all cursor-pointer flex items-center gap-1">
                  <RotateCcw size={12} /> Limpiar
                </button>
              </div>
            </div>

            <div className="overflow-y-auto px-5 py-4 space-y-2 flex-1">
              {allReturned ? (
                <div className="flex flex-col items-center justify-center py-10 text-[var(--app-text-muted)]">
                  <AlertTriangle size={34} className="mb-2 text-amber-500" />
                  <p className="font-semibold text-sm">Esta factura ya fue devuelta por completo.</p>
                </div>
              ) : (
                data.lines.map((l) => {
                  const max = toNum(l.returnableQuantity);
                  const q = toNum(quantities[l.saleDetailId]);
                  const disabled = max <= 0;
                  return (
                    <div key={l.saleDetailId} className={`rounded-xl border p-3 flex items-center gap-3 ${disabled ? 'opacity-50 border-[var(--app-border)]' : 'border-[var(--app-border)]'}`}>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-[var(--app-text)] truncate">{l.product?.name}</p>
                        <p className="text-[11px] text-[var(--app-text-muted)] font-medium">
                          {l.product?.barcode}
                          {l.batchCode ? ` · Lote ${l.batchCode}` : ''}
                        </p>
                        <p className="text-[11px] text-[var(--app-text-soft)] mt-0.5">
                          Vendido: {toNum(l.quantity)} · Devuelto: {toNum(l.returnedQuantity)} · <span className="font-bold">Disp: {max}</span>
                          <span className="mx-1.5 opacity-40">|</span>
                          {formatMoney(l.unitRefund)} c/u
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <input
                          type="number"
                          min="0"
                          max={max}
                          step="1"
                          value={q}
                          disabled={disabled}
                          onChange={(e) => setQty(l.saleDetailId, e.target.value, max)}
                          className="w-20 px-2 py-2 text-center bg-[var(--app-bg-subtle)]/50 border border-[var(--app-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-sm font-bold text-[var(--app-text)] disabled:cursor-not-allowed"
                        />
                        <span className="w-24 text-right font-black text-sm text-rose-600">
                          {formatMoney(q * toNum(l.unitRefund))}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {!allReturned && (
              <div className="px-5 py-3 border-t border-[var(--app-border)] space-y-3 shrink-0">
                <div>
                  <label className="block text-[11px] font-bold text-[var(--app-text)] mb-1.5 uppercase tracking-wider">Motivo de la devolución *</label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--app-bg-subtle)]/50 border border-[var(--app-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-xs font-medium text-[var(--app-text)]"
                  >
                    {REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                  {reason === 'Otro' && (
                    <input
                      type="text"
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      placeholder="Describa el motivo..."
                      className="mt-2 w-full px-3 py-2 bg-[var(--app-bg-subtle)]/50 border border-[var(--app-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-xs font-medium text-[var(--app-text)]"
                    />
                  )}
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="text-sm">
                    <span className="text-[var(--app-text-muted)] font-semibold">Total a devolver</span>
                    <p className="text-2xl font-black text-rose-600 leading-none mt-0.5">{formatMoney(totalRefund)}</p>
                    <span className="text-[11px] text-[var(--app-text-muted)]">{selectedCount} línea(s)</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={onClose} className="px-4 py-2.5 bg-[var(--app-surface)] text-[var(--app-text-soft)] border border-[var(--app-border)] rounded-lg font-bold text-xs hover:bg-[var(--app-bg-subtle)] transition-all cursor-pointer">
                      Cancelar
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={submitting || totalRefund <= 0}
                      className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600 text-white rounded-lg font-bold text-xs transition-all shadow-enterprise disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                    >
                      {submitting ? <Loader2 size={14} className="animate-spin" /> : <Undo2 size={14} />}
                      Generar Nota de Crédito
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RefundModal;
