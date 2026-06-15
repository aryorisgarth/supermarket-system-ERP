import React from 'react';
import { Landmark, CheckCircle2, CreditCard, Banknote } from 'lucide-react';
import Card from '../ui/Card';

const FinanceMetrics = ({ summary, transactionsCount, money }) => {
  const StatBox = ({ title, value, icon: Icon, tone = 'blue', hint }) => {
    const toneClass = {
      blue: 'bg-[var(--app-primary-soft)] text-[var(--app-primary)]',
      green: 'bg-[var(--app-success-soft)] text-[var(--app-success)]',
      amber: 'bg-[var(--app-warning-soft)] text-[var(--app-warning)]',
      red: 'bg-[var(--app-danger-soft)] text-[var(--app-danger)]',
    }[tone];

    return (
      <Card className="min-h-[118px]">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--app-text-muted)]">{title}</p>
            <p className="mt-2 truncate text-2xl font-bold text-[var(--app-text)] tabular-nums">{value}</p>
            {hint && <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-[var(--app-text-muted)]">{hint}</p>}
          </div>
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${toneClass}`}>
            <Icon size={20} />
          </span>
        </div>
      </Card>
    );
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatBox 
        title="Pendiente de depósito" 
        value={money(summary.pendingNet)} 
        icon={Landmark} 
        tone="amber" 
        hint={`${summary.pending?.length || 0} transacciones`} 
      />
      <StatBox 
        title="Liquidado" 
        value={money(summary.settledNet)} 
        icon={CheckCircle2} 
        tone="green" 
        hint={`${summary.settled?.length || 0} depósitos`} 
      />
      <StatBox 
        title="Comisiones" 
        value={money(summary.commissions)} 
        icon={CreditCard} 
        tone="red" 
        hint={`${(summary.commissionRate || 0).toFixed(2)}% promedio`} 
      />
      <StatBox 
        title="Volumen procesado" 
        value={money(summary.gross)} 
        icon={Banknote} 
        tone="blue" 
        hint={`${transactionsCount} movimientos`} 
      />
    </div>
  );
};

export default FinanceMetrics;
