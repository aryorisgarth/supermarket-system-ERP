import React from 'react';
import { X, Loader2, AlertTriangle, Wallet } from 'lucide-react';
import Card, { CardHeader } from '../ui/Card';
import Badge from '../ui/Badge';

const SessionDetailModal = ({
  isOpen,
  onClose,
  loading,
  summary,
  statusLabel,
  formatDateTime,
  formatMoney
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-[var(--app-border)] bg-[var(--app-surface)] px-6 py-4">
          <div>
            <p className="ui-eyebrow text-[var(--app-text-muted)]">Detalle de turno</p>
            <h3 className="text-xl font-black text-[var(--app-text)]">
              Turno #{summary?.session?.id || '...'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-[var(--app-text-muted)] hover:bg-[var(--app-bg-subtle)] cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div className="flex h-56 items-center justify-center">
            <Loader2 className="animate-spin text-[var(--app-primary)]" size={32} />
          </div>
        ) : summary ? (
          <div className="space-y-6 p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-[var(--app-border)] p-4">
                <p className="text-[10px] font-black uppercase text-[var(--app-text-muted)]">Cajero</p>
                <p className="mt-1 font-black">{summary.session.cashierName}</p>
              </div>
              <div className="rounded-xl border border-[var(--app-border)] p-4">
                <p className="text-[10px] font-black uppercase text-[var(--app-text-muted)]">Estado</p>
                <p className="mt-1 font-black">{statusLabel[summary.session.status]}</p>
              </div>
              <div className="rounded-xl border border-[var(--app-border)] p-4">
                <p className="text-[10px] font-black uppercase text-[var(--app-text-muted)]">Fondo inicial</p>
                <p className="mt-1 font-black tabular-nums">{formatMoney(summary.session.openingBalance)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                ['Ventas efectivo', summary.cashSales],
                ['Ventas tarjeta', summary.cardSales],
                ['Transferencias', summary.transferSales],
                ['Cambio entregado', summary.changeAmount],
                ['Devoluciones', summary.refunds],
                ['Ingresos manuales', summary.manualCashIn],
                ['Retiros manuales', summary.manualCashOut],
                ['Efectivo esperado', summary.expectedCash],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-[var(--app-bg-subtle)] p-3">
                  <p className="text-[10px] font-black uppercase text-[var(--app-text-muted)]">{label}</p>
                  <p className="mt-1 font-black tabular-nums">{formatMoney(value)}</p>
                </div>
              ))}
            </div>

            {summary.session.status === 'CLOSED' && (
              <Card>
                <CardHeader icon={AlertTriangle} title="Cuadre de cierre" description="Comparación entre lo esperado y lo contado." />
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div className="rounded-xl border border-[var(--app-border)] p-4">
                    <p className="text-[10px] font-black uppercase text-[var(--app-text-muted)]">Dif. efectivo</p>
                    <p className="mt-1 font-black tabular-nums">{formatMoney(summary.session.difference)}</p>
                  </div>
                  <div className="rounded-xl border border-[var(--app-border)] p-4">
                    <p className="text-[10px] font-black uppercase text-[var(--app-text-muted)]">Dif. tarjeta</p>
                    <p className="mt-1 font-black tabular-nums">{formatMoney(summary.session.cardDifference)}</p>
                  </div>
                  <div className="rounded-xl border border-[var(--app-border)] p-4">
                    <p className="text-[10px] font-black uppercase text-[var(--app-text-muted)]">Dif. transferencia</p>
                    <p className="mt-1 font-black tabular-nums">{formatMoney(summary.session.transferDifference)}</p>
                  </div>
                </div>
                {summary.session.notes && (
                  <p className="mt-4 rounded-xl bg-[var(--app-bg-subtle)] p-3 text-sm text-[var(--app-text-soft)]">
                    <span className="font-black">Notas:</span> {summary.session.notes}
                  </p>
                )}
              </Card>
            )}

            <Card>
              <CardHeader icon={Wallet} title="Movimientos manuales" description="Ingresos y retiros registrados durante el turno." />
              <div className="overflow-x-auto">
                <table className="ui-table w-full">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Tipo</th>
                      <th>Motivo</th>
                      <th className="text-right">Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(summary.movements || []).map((movement) => (
                      <tr key={movement.id}>
                        <td className="text-sm text-[var(--app-text-muted)]">{formatDateTime(movement.createdAt)}</td>
                        <td>
                          <Badge tone={movement.type === 'CASH_IN' ? 'green' : 'amber'}>
                            {movement.type === 'CASH_IN' ? 'Ingreso' : 'Retiro'}
                          </Badge>
                        </td>
                        <td className="font-medium text-[var(--app-text-soft)]">{movement.reason}</td>
                        <td className="text-right font-black tabular-nums">{formatMoney(movement.amount)}</td>
                      </tr>
                    ))}
                    {(summary.movements || []).length === 0 && (
                      <tr>
                        <td colSpan="4" className="py-8 text-center text-xs font-bold uppercase text-[var(--app-text-muted)]">
                          Sin movimientos manuales
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default SessionDetailModal;
