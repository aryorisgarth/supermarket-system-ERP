import React from 'react';
import { X, Printer } from 'lucide-react';
import Button from '../ui/Button';
import { parseClosureAlerts } from '../../utils/dailyClosurePrint';

const DailyCloseDetailModal = ({
  isOpen,
  onClose,
  closure,
  onPrintHistory,
  formatMoney
}) => {
  if (!isOpen || !closure) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--app-bg)]/70 p-4 backdrop-blur-sm no-print">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-[var(--app-border)] bg-[var(--app-surface)] px-5 py-4">
          <div>
            <h3 className="text-lg font-black text-[var(--app-text)]">Acta del {closure.closureDate}</h3>
            <p className="text-xs font-bold text-[var(--app-text-muted)]">
              Cerrado por {closure.closedBy?.fullName || '—'} · {closure.closedAt ? new Date(closure.closedAt).toLocaleString() : '—'}
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-[var(--app-text-muted)] hover:bg-[var(--app-bg-subtle)] cursor-pointer" aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-4 p-5 text-sm">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-xl border border-[var(--app-border)] p-3"><p className="text-[10px] font-black uppercase text-[var(--app-text-muted)]">Ventas</p><p className="mt-1 font-black">{formatMoney(closure.totalSales)}</p></div>
            <div className="rounded-xl border border-[var(--app-border)] p-3"><p className="text-[10px] font-black uppercase text-[var(--app-text-muted)]">Utilidad</p><p className="mt-1 font-black">{formatMoney(closure.grossProfit)}</p></div>
            <div className="rounded-xl border border-[var(--app-border)] p-3"><p className="text-[10px] font-black uppercase text-[var(--app-text-muted)]">Margen</p><p className="mt-1 font-black">{Number(closure.grossMarginPercentage || 0).toFixed(2)}%</p></div>
            <div className="rounded-xl border border-[var(--app-border)] p-3"><p className="text-[10px] font-black uppercase text-[var(--app-text-muted)]">Dif. caja</p><p className="mt-1 font-black">{formatMoney(closure.totalDifference)}</p></div>
          </div>
          <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)] p-4 space-y-1 text-xs font-bold text-[var(--app-text-soft)]">
            <p>Efectivo: {formatMoney(closure.totalCashSales)} (dif. {formatMoney(closure.totalCashDifference)})</p>
            <p>Tarjeta: {formatMoney(closure.totalCardSales)} · Transferencia: {formatMoney(closure.totalTransferSales)}</p>
            <p>Compras recibidas: {formatMoney(closure.receivedPurchasesAmount)} · Stock crítico: {closure.stockAlertsCount}</p>
          </div>
          {parseClosureAlerts(closure.alertsJson, []).length > 0 && (
            <div>
              <p className="mb-2 text-[10px] font-black uppercase text-[var(--app-text-muted)]">Alertas</p>
              <ul className="space-y-2">
                {parseClosureAlerts(closure.alertsJson, []).map((alert, i) => (
                  <li key={i} className="rounded-lg border border-[var(--app-border)] px-3 py-2 text-xs font-bold">{alert.title}: {alert.text}</li>
                ))}
              </ul>
            </div>
          )}
          {closure.notes && (
            <div>
              <p className="mb-2 text-[10px] font-black uppercase text-[var(--app-text-muted)]">Notas</p>
              <p className="rounded-lg border border-[var(--app-border)] bg-[var(--app-bg-subtle)] p-3 text-xs whitespace-pre-wrap">{closure.notes}</p>
            </div>
          )}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button icon={Printer} onClick={() => onPrintHistory(closure)}>Imprimir acta</Button>
            <Button variant="secondary" onClick={onClose}>Cerrar</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyCloseDetailModal;
