import React from 'react';
import { ShoppingBag } from 'lucide-react';
import Card, { CardHeader } from '../ui/Card';

const num = (value) => Number(value || 0);

const PurchasesVsSalesAnalysis = ({
  purchasesVsSales,
  salesByUser,
  customerRanking,
  bestCashier,
  bestCustomer,
  money,
}) => {
  return (
    <Card>
      <CardHeader
        icon={ShoppingBag}
        title="Compras vs Ventas"
        description="Evalúa si el abastecimiento acompaña la demanda real del periodo."
      />
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-[var(--app-bg-subtle)] p-4">
          <p className="text-[10px] font-black uppercase tracking-wider text-[var(--app-text-muted)]">Ventas</p>
          <p className="mt-2 text-xl font-black text-[var(--app-primary)]">{money(purchasesVsSales?.totalSales)}</p>
        </div>
        <div className="rounded-2xl bg-[var(--app-bg-subtle)] p-4">
          <p className="text-[10px] font-black uppercase tracking-wider text-[var(--app-text-muted)]">Compras</p>
          <p className="mt-2 text-xl font-black text-[var(--app-text)]">{money(purchasesVsSales?.totalPurchases)}</p>
        </div>
        <div className="rounded-2xl bg-[var(--app-bg-subtle)] p-4">
          <p className="text-[10px] font-black uppercase tracking-wider text-[var(--app-text-muted)]">Diferencia</p>
          <p className={`mt-2 text-xl font-black ${num(purchasesVsSales?.netDifference) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {money(purchasesVsSales?.netDifference)}
          </p>
        </div>
      </div>
      <p className="mt-5 rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)] p-4 text-sm leading-6 text-[var(--app-text-soft)]">
        Las compras representan {Number(purchasesVsSales?.purchasesToSalesPercentage || 0).toFixed(1)}% de las ventas del periodo.
        {num(purchasesVsSales?.purchasesToSalesPercentage) > 80
          ? ' El abastecimiento está alto frente a las ventas; revisa sobreinventario.'
          : ' La relación compra/venta se mantiene dentro de un rango manejable.'}
      </p>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <h4 className="mb-3 text-xs font-black uppercase tracking-wider text-[var(--app-text-muted)]">Top cajeros</h4>
          <div className="space-y-2">
            {salesByUser.slice(0, 5).map((item, index) => (
              <div key={item.userFullName || index} className="flex justify-between rounded-xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)] px-3 py-2 text-sm">
                <span className="font-bold text-[var(--app-text-soft)]">{item.userFullName || 'Usuario'}</span>
                <span className="font-black">{money(item.totalSales)}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="mb-3 text-xs font-black uppercase tracking-wider text-[var(--app-text-muted)]">Clientes destacados</h4>
          <div className="space-y-2">
            {customerRanking.slice(0, 5).map((item, index) => (
              <div key={item.identifier || index} className="flex justify-between rounded-xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)] px-3 py-2 text-sm">
                <span className="font-bold text-[var(--app-text-soft)]">{item.customerFullName || 'Cliente'}</span>
                <span className="font-black">{money(item.totalSpent)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {(bestCashier || bestCustomer) && (
        <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-800">
          <b>Análisis:</b> {bestCashier?.userFullName || 'Sin cajero líder'} lidera ventas por usuario
          {bestCashier ? ` con ${money(bestCashier.totalSales)}` : ''}. El cliente de mayor valor es{' '}
          {bestCustomer?.customerFullName || 'no determinado'}
          {bestCustomer ? ` con ${money(bestCustomer.totalSpent)} acumulado.` : '.'}
        </div>
      )}
    </Card>
  );
};

export default PurchasesVsSalesAnalysis;
