import React from 'react';
import { Store, Banknote, Wallet, CreditCard } from 'lucide-react';
import Card from '../ui/Card';

const StatCard = ({ title, value, hint, icon: Icon, tone = 'blue' }) => {
  const toneClass = {
    blue: 'bg-[var(--app-primary-soft)] text-[var(--app-primary)]',
    green: 'bg-[var(--app-success-soft)] text-[var(--app-success)]',
    amber: 'bg-[var(--app-warning-soft)] text-[var(--app-warning)]',
    red: 'bg-[var(--app-danger-soft)] text-[var(--app-danger)]',
  }[tone];

  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[var(--app-text-muted)]">{title}</p>
          <p className="mt-2 truncate text-2xl font-black text-[var(--app-text)] tabular-nums">{value}</p>
          {hint && <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-[var(--app-text-muted)]">{hint}</p>}
        </div>
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${toneClass}`}>
          <Icon size={20} />
        </span>
      </div>
    </Card>
  );
};

const DailyCloseKpis = ({ summary, kpis, cashReport, formatMoney }) => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard 
        title="Ventas del día" 
        value={formatMoney(summary.salesTotal)} 
        hint={`${kpis?.salesCount || 0} ventas pagadas`} 
        icon={Store} 
        tone="blue" 
      />
      <StatCard 
        title="Utilidad bruta" 
        value={formatMoney(summary.grossProfit)} 
        hint={`${summary.margin.toFixed(2)}% margen estimado`} 
        icon={Banknote} 
        tone="green" 
      />
      <StatCard 
        title="Diferencia cajas" 
        value={formatMoney(summary.totalDifference)} 
        hint={`${cashReport?.sessionsWithDifference || 0} cierre(s) con diferencia`} 
        icon={Wallet} 
        tone={Math.abs(summary.totalDifference) > 0.009 ? 'red' : 'green'} 
      />
      <StatCard 
        title="Tarjeta pendiente" 
        value={formatMoney(summary.pendingSettlementNet)} 
        hint={`${summary.pendingSettlements.length} liquidaciones`} 
        icon={CreditCard} 
        tone={summary.pendingSettlements.length ? 'amber' : 'green'} 
      />
    </div>
  );
};

export default DailyCloseKpis;
