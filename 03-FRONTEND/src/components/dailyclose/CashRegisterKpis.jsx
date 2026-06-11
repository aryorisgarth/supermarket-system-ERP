import React from 'react';
import { Wallet, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import Card from '../ui/Card';

const StatCard = ({ title, value, icon: Icon, tone = 'blue', hint }) => {
  const toneClass = {
    blue: 'text-[var(--app-primary)] bg-[var(--app-primary-soft)]',
    green: 'text-[var(--app-success)] bg-[var(--app-success-soft)]',
    amber: 'text-[var(--app-warning)] bg-[var(--app-warning-soft)]',
    red: 'text-[var(--app-danger)] bg-[var(--app-danger-soft)]',
  }[tone];

  return (
    <Card className="min-h-[118px]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="ui-eyebrow mb-2 text-[var(--app-text-muted)]">{title}</p>
          <h3 className="truncate text-2xl font-black text-[var(--app-text)] tabular-nums">{value}</h3>
          {hint && <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-[var(--app-text-muted)]">{hint}</p>}
        </div>
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${toneClass}`}>
          <Icon size={20} />
        </span>
      </div>
    </Card>
  );
};

const CashRegisterKpis = ({ report, activeSessionsCount, from, to, diffTone, formatMoney }) => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Turnos abiertos"
        value={report?.openSessionsCount ?? activeSessionsCount}
        icon={Wallet}
        tone="green"
        hint="En tiempo real"
      />
      <StatCard
        title="Turnos cerrados"
        value={report?.closedSessionsCount ?? 0}
        icon={Clock}
        tone="blue"
        hint={`${from} → ${to}`}
      />
      <StatCard
        title="Ventas del periodo"
        value={formatMoney(report?.totalSalesVolume)}
        icon={TrendingUp}
        tone="amber"
        hint="Efectivo + tarjeta + transferencia"
      />
      <StatCard
        title="Descuadre efectivo"
        value={formatMoney(report?.totalCashDifference)}
        icon={AlertTriangle}
        tone={diffTone(report?.totalCashDifference)}
        hint={`${report?.sessionsWithDifference ?? 0} turnos con diferencia`}
      />
    </div>
  );
};

export default CashRegisterKpis;
