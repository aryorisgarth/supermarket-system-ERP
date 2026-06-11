import React from 'react';
import { ClipboardCheck, PackageCheck, CreditCard } from 'lucide-react';
import Card, { CardHeader } from '../ui/Card';

const DailyCloseSummaryGrid = ({
  summary,
  cashReport,
  paymentMethods,
  stockAlertsCount,
  formatMoney
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader icon={ClipboardCheck} title="Resumen de caja" description="Consolidado de sesiones y diferencias por método." />
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)] p-4">
            <p className="text-[10px] font-black uppercase text-[var(--app-text-muted)]">Sesiones</p>
            <p className="mt-2 text-sm font-bold text-[var(--app-text-soft)]">
              {cashReport?.closedSessionsCount || 0} cerradas / {cashReport?.openSessionsCount || 0} abiertas
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)] p-4">
            <p className="text-[10px] font-black uppercase text-[var(--app-text-muted)]">Volumen por caja</p>
            <p className="mt-2 text-sm font-bold text-[var(--app-text-soft)]">{formatMoney(cashReport?.totalSalesVolume)}</p>
          </div>
          <div className="rounded-2xl border border-[var(--app-border)] p-4">
            <p className="text-[10px] font-black uppercase text-[var(--app-text-muted)]">Efectivo</p>
            <p className="mt-2 font-black">{formatMoney(cashReport?.totalCashSales)}</p>
            <p className="text-xs font-bold text-[var(--app-text-muted)]">Dif: {formatMoney(cashReport?.totalCashDifference)}</p>
          </div>
          <div className="rounded-2xl border border-[var(--app-border)] p-4">
            <p className="text-[10px] font-black uppercase text-[var(--app-text-muted)]">Tarjeta / transferencia</p>
            <p className="mt-2 font-black">{formatMoney(Number(cashReport?.totalCardSales || 0) + Number(cashReport?.totalTransferSales || 0))}</p>
            <p className="text-xs font-bold text-[var(--app-text-muted)]">
              Dif: {formatMoney(Number(cashReport?.totalCardDifference || 0) + Number(cashReport?.totalTransferDifference || 0))}
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader icon={PackageCheck} title="Compras e inventario" description="Mercadería recibida y pendientes de abastecimiento." />
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)] p-4">
            <p className="text-[10px] font-black uppercase text-[var(--app-text-muted)]">Recibido hoy</p>
            <p className="mt-2 text-xl font-black">{formatMoney(summary.receivedPurchaseAmount)}</p>
          </div>
          <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)] p-4">
            <p className="text-[10px] font-black uppercase text-[var(--app-text-muted)]">Compras pendientes</p>
            <p className="mt-2 text-xl font-black">{summary.pendingPurchases.length}</p>
          </div>
          <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)] p-4">
            <p className="text-[10px] font-black uppercase text-[var(--app-text-muted)]">Stock crítico</p>
            <p className="mt-2 text-xl font-black text-[var(--app-danger)]">{stockAlertsCount}</p>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader icon={CreditCard} title="Ventas por método de pago" description="Distribución comercial del día." />
        <div className="mt-4 overflow-x-auto">
          <table className="ui-table w-full min-w-[520px]">
            <thead>
              <tr>
                <th>Método</th>
                <th className="text-right">Cantidad</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--app-border)]">
              {paymentMethods.map((item) => (
                <tr key={item.paymentMethod || item.method}>
                  <td className="font-black">{item.paymentMethod || item.method}</td>
                  <td className="text-right font-bold">{item.paymentCount || item.count || 0}</td>
                  <td className="text-right font-black">{formatMoney(item.totalAmount || item.amount)}</td>
                </tr>
              ))}
              {paymentMethods.length === 0 && (
                <tr>
                  <td colSpan="3" className="py-10 text-center text-xs font-bold text-[var(--app-text-muted)]">
                    Sin pagos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default DailyCloseSummaryGrid;
