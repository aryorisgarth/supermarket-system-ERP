import React from 'react';
import { FileText, Printer } from 'lucide-react';
import Button from '../ui/Button';
import ResponsiveModal from '../ui/ResponsiveModal';
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
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      icon={FileText}
      title={`Acta del ${closure.closureDate}`}
      subtitle={`Cerrado por ${closure.closedBy?.fullName || '—'} · ${closure.closedAt ? new Date(closure.closedAt).toLocaleString() : '—'}`}
      initialSize="md"
      sizeOptions={['md', 'lg', 'xl']}
      panelClassName="no-print"
    >
      <div className="space-y-4 p-5 text-sm">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-xl border border-[var(--app-border)] p-3"><p className="text-[10px] font-bold uppercase text-[var(--app-text-muted)]">Ventas</p><p className="mt-1 font-bold">{formatMoney(closure.totalSales)}</p></div>
          <div className="rounded-xl border border-[var(--app-border)] p-3"><p className="text-[10px] font-bold uppercase text-[var(--app-text-muted)]">Utilidad</p><p className="mt-1 font-bold">{formatMoney(closure.grossProfit)}</p></div>
          <div className="rounded-xl border border-[var(--app-border)] p-3"><p className="text-[10px] font-bold uppercase text-[var(--app-text-muted)]">Margen</p><p className="mt-1 font-bold">{Number(closure.grossMarginPercentage || 0).toFixed(2)}%</p></div>
          <div className="rounded-xl border border-[var(--app-border)] p-3"><p className="text-[10px] font-bold uppercase text-[var(--app-text-muted)]">Dif. caja</p><p className="mt-1 font-bold">{formatMoney(closure.totalDifference)}</p></div>
        </div>
        <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)] p-4 space-y-1 text-xs font-bold text-[var(--app-text-soft)]">
          <p>Efectivo: {formatMoney(closure.totalCashSales)} (dif. {formatMoney(closure.totalCashDifference)})</p>
          <p>Tarjeta: {formatMoney(closure.totalCardSales)} · Transferencia: {formatMoney(closure.totalTransferSales)}</p>
          <p>Compras recibidas: {formatMoney(closure.receivedPurchasesAmount)} · Stock crítico: {closure.stockAlertsCount}</p>
        </div>
        {parseClosureAlerts(closure.alertsJson, []).length > 0 && (
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase text-[var(--app-text-muted)]">Alertas</p>
            <ul className="space-y-2">
              {parseClosureAlerts(closure.alertsJson, []).map((alert, i) => (
                <li key={i} className="rounded-lg border border-[var(--app-border)] px-3 py-2 text-xs font-bold">{alert.title}: {alert.text}</li>
              ))}
            </ul>
          </div>
        )}
        {closure.notes && (
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase text-[var(--app-text-muted)]">Notas</p>
            <p className="rounded-lg border border-[var(--app-border)] bg-[var(--app-bg-subtle)] p-3 text-xs whitespace-pre-wrap">{closure.notes}</p>
          </div>
        )}
        <div className="flex flex-wrap gap-2 pt-2">
          <Button icon={Printer} onClick={() => onPrintHistory(closure)}>Imprimir acta</Button>
          <Button variant="secondary" onClick={onClose}>Cerrar</Button>
        </div>
      </div>
    </ResponsiveModal>
  );
};

export default DailyCloseDetailModal;
